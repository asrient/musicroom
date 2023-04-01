import pandas as pd
from pyspark import SparkConf
from pyspark.sql import SQLContext, SparkSession
from pyspark.sql.types import *
import json
from pyspark.sql import functions as F
from pyspark.ml.recommendation import ALS
from pyspark.ml.evaluation import RegressionEvaluator

'''
Specially designed for musicroom data, 
since we don't need to map user_id and track_id to ints.
Input data is a csv file with 3 columns: user_id, track_id, frequency.
'''

class ALSRecommendor:

    def __init__(self, spark):
        self.spark = spark
        self.model = None
        self.total_df = None

    def load_data_from_csv(self, file_path):
        df = pd.read_csv(file_path)
        history_schema = StructType(
        [StructField('user_id', IntegerType()),
        StructField('track_id', IntegerType()),
        StructField('frequency', IntegerType())]
        )
        # It seems this step requires huge Memory; 
        # be sure to upgrade your system to at least 15GB RAM (>30GB RAM suggested)
        # might take over 10 mins
        # 1m 16s
        self.total_df = self.spark.createDataFrame(df, schema=history_schema)
        # cache in memory 
        # because we will revisit them from time to time
        self.total_df.cache()


    def train(self, rank = 6, regParam = 0.25):
        train_df, test_df = self.total_df.randomSplit([0.7, 0.3])
        # make sure all frequency in double type
        train_df = train_df.withColumn("frequency", train_df["frequency"].cast(DoubleType()))
        test_df = test_df.withColumn("frequency", test_df["frequency"].cast(DoubleType()))

        # ALS has strict requirement for data type
        # bigint is very problematic
        # make bigint to int

        #train_df = train_df.withColumn("user_id", train_df["user_id"].cast(IntegerType()))
        #train_df = train_df.withColumn("track_id", train_df["track_id"].cast(IntegerType()))

        #test_df = test_df.withColumn("user_id", test_df["user_id"].cast(IntegerType()))
        #test_df = test_df.withColumn("track_id", test_df["track_id"].cast(IntegerType()))
        # Cache those to save memory

        train_df = train_df.cache()
        test_df = test_df.cache()
        print('all data prepared!')
        als = ALS(coldStartStrategy = 'nan').setMaxIter(5)\
            .setItemCol("track_id")\
            .setRatingCol("frequency")\
            .setUserCol("user_id")
        print('About to start training..')
        # best parameters
        # 6m 32s
        als.setParams(rank = rank, regParam = regParam)
        try:
            self.model = als.fit(train_df)
        except Exception as e:
            print('Error training model:', e)
        print('Training done. Analyzing rmse..')
        predict_df = self.model.transform(test_df)

        # evaluation metric - RMSE
        eval_metric = RegressionEvaluator(predictionCol="prediction",
                                labelCol="frequency",
                                metricName="rmse")

        # Remove nan
        predicted_test_df = predict_df.filter(predict_df.prediction != float('nan'))
        # round to int
        predicted_test_df = predicted_test_df.withColumn("prediction", F.abs(F.round(predicted_test_df["prediction"],0)))
        try:
          test_RMSE = eval_metric.evaluate(predicted_test_df)
          print('The final RMSE on the test set is {0}'.format(test_RMSE))
          return test_RMSE
        except Exception as e:
          print('err finding rmse:', str(e))

    def get_users(self, limit=200):
        return  [u[0] for u in self.total_df.select('user_id').distinct().limit(limit).collect()]

    def recommend(self, user_id, limit=20):
        if self.model is None:
            raise Exception('Model not trained yet')
        user = int(user_id)
        print(f'Generating recommendation for user: {user}')
        tracks = self.total_df.filter(self.total_df.user_id == user_id).select('track_id')

        listened_track = []
        for track in tracks.collect():
            listened_track.append(track['track_id'])
        print('listened_track count:', len(listened_track))
        unlistened_track = self.total_df.filter(~ self.total_df['track_id'].isin(listened_track))\
                                    .select('track_id')\
                                    .withColumn('user_id', F.lit(user))\
                                .distinct().select('user_id', 'track_id')
        
        # make prediction
        predicted_listens = self.model.transform(unlistened_track).distinct()
        predicted_listens = predicted_listens.filter(predicted_listens['prediction'] != float('nan'))
        #predicted_listens = predicted_listens.filter(predicted_listens['prediction'] > 2.0)
        return predicted_listens.join(self.total_df, 'track_id').select('track_id', 'prediction')\
                    .distinct()\
                    .orderBy('prediction', ascending = False).limit(limit)

    def recommend_and_save(self, original_user_id, limit=20, file_path = None):
        try:
            result = self.recommend(original_user_id, limit)
            if result is None or result.count() == 0:
                print('No recommendation for user:', original_user_id)
                return False
            # save to csv
            result.toPandas().to_csv(file_path or f'recommendation/{original_user_id}.csv', index=False)
            return True
        except Exception as e:
            print('Error saving recommendation for user:', original_user_id, e)
        return False

    @classmethod
    def setup_spark(cls, app_name= 'App'):
        conf = SparkConf().setAppName(app_name)
        conf = (conf.set('spark.executor.memory', '30G')
                    .set('spark.driver.memory', '30G')
                    .set('spark.driver.maxResultSize', '30G')
                    .set('spark.sql.execution.arrow.pyspark.enabled', 'true'))

        spark = SparkSession.builder\
                            .config(conf=conf)\
                            .appName('LJ')\
                            .getOrCreate()
        return spark
    