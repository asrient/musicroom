from Recommendor import ALSRecommendor
import pandas as pd

INPUT_DATA_PATH = '../data/input/'
OUTPUT_DATA_PATH = '../data/output/'


if __name__ == "__main__":
    spark = ALSRecommendor.setup_spark()
    r = ALSRecommendor(spark)

    r.load_data_from_csv(INPUT_DATA_PATH + 'listening_history.csv')

    r.train(rank=6, regParam=0.25)

    users = pd.read_csv(INPUT_DATA_PATH + 'target_users.csv')
    user_ids = users['user_id'].tolist()

    for user_id in user_ids:
        r.recommend_and_save(user_id, limit=20, file_path=f'{OUTPUT_DATA_PATH}user_rs/user_{user_id}.csv')
