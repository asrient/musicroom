#!/usr/bin/bash
# This script is used to run the user_rs.py script
cd "$(dirname "$0")"
source venv/bin/activate
cd user_rs
python rs_script.py "$@"
