from Recommendor2 import ALSRecommendor
import pandas as pd
import sys


INPUT_DATA_PATH = '../data/input/'
OUTPUT_DATA_PATH = '../data/output/'
DEFAULT_RANK = 6
DEFAULT_REG_PARAM = 0.25
DEFAULT_LIMIT = 20

def get_args():
    args = sys.argv
    res = {
        'rank': DEFAULT_RANK,
        'regParam': DEFAULT_REG_PARAM,
        'limit': DEFAULT_LIMIT,
        'user_ids': []
    }
    for arg in args:
        if arg == 'rs_script.py':
            continue
        if arg.startswith('rank='):
            res['rank'] = int(arg.split('=')[1])
        elif arg.startswith('regParam='):
            res['regParam'] = float(arg.split('=')[1])
        elif arg.startswith('limit='):
            res['limit'] = int(arg.split('=')[1])
        elif arg.startswith('user_ids='):
            res['user_ids'] = arg.split('=')[1].split(',')
        elif arg.startswith('user_id='):
            res['user_ids'].append(arg.split('=')[1])
    return res

if __name__ == "__main__":
    args = get_args()

    spark = ALSRecommendor.setup_spark()
    r = ALSRecommendor(spark)

    r.load_data_from_csv(INPUT_DATA_PATH + 'listening_history.csv')

    r.train(rank=args['rank'], regParam=args['regParam'])

    user_ids = args['user_ids']
    if len(args['user_ids']) == 0:
        try:
            users = pd.read_csv(INPUT_DATA_PATH + 'target_users.csv')
            user_ids = users['user_id'].tolist()
        except:
            print('No user_ids provided and no target_users.csv found in input data folder')
            sys.exit(0)

    for user_id in user_ids:
        r.recommend_and_save(user_id, limit=20, file_path=f'{OUTPUT_DATA_PATH}/user_{user_id}.csv')
