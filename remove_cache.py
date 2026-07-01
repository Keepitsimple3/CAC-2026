import shutil
from pathlib import Path

cache_path = Path(r"C:\Users\akraw\.cache\kagglehub\datasets\bryandarquea\psg-audio-apnea-audios\versions\3")
paths  = r"C:\Users\akraw\.cache\kagglehub\datasets\ecerulm\apneaecg"
if cache_path.exists():
    shutil.rmtree(cache_path)
    print("Dataset cleared from cache successfully.")
else:
    print("Path does not exist or has already been deleted.")