#!/usr/bin/bash
cd musicKit
source venv/bin/activate
python3 -m uvicorn app:app --reload --port 8001