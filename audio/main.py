import os
import sys
import numpy as np
import kagglehub
from pathlib import Path
from dotenv import load_dotenv
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report

def get_percentage_of_files(percentage=0.10):
    all_dataset_files = [
        "APNEA_types/00000995-100507_ap_types.npy",
        "APNEA_types/00000999-100507_ap_types.npy",
        "APNEA_types/00001000-100507_ap_types.npy",
        "APNEA_types/00001006-100507_ap_types.npy",
        "APNEA_types/00001008-100507_ap_types.npy",
        "APNEA_types/00001010-100507_ap_types.npy",
        "APNEA_types/00001014-100507_ap_types.npy",
        "APNEA_types/00001016-100507_ap_types.npy",
        "APNEA_types/00001018-100507_ap_types.npy",
        "APNEA_types/00001020-100507_ap_types.npy"
    ]
    limit = max(1, int(len(all_dataset_files) * percentage))
    return all_dataset_files[:limit]

def download_and_load_subset(file_paths):
    X_data = []
    for target_file in file_paths:
        local_file_path = kagglehub.dataset_download(
            "bryandarquea/psg-audio-apnea-audios",
            path=target_file
        )
        matrix = np.load(local_file_path)
        if matrix.ndim == 1:
            matrix = matrix.reshape(-1, 1)
        X_data.append(matrix)
    return np.concatenate(X_data, axis=0)

def run_ml_pipeline(X_train, X_test, y_train, y_test):
    # max_depth controls overfitting by limiting how complex the trees get
    model = RandomForestClassifier(n_estimators=100, max_depth=10, random_state=42)
    
    print("Training model...")
    model.fit(X_train, y_train)
    
    print("Evaluating model...")
    predictions = model.predict(X_test)
    
    accuracy = accuracy_score(y_test, predictions)
    print(f"Actual Test Accuracy: {accuracy * 100:.2f}%")
    print("\nClassification Report:")
    print(classification_report(y_test, predictions))
    
    return model

if __name__ == "__main__":
    current_dir = Path(__file__).resolve().parent
    env_path = current_dir.parent / '.env'
    load_dotenv(dotenv_path=env_path)

    if not os.environ.get("KAGGLE_USERNAME") or not os.environ.get("KAGGLE_KEY"):
        sys.exit(1)

    selected_files = get_percentage_of_files(percentage=0.30)
    features_matrix = download_and_load_subset(selected_files)
    
    # Flatten features if they are high-dimensional vectors per row
    if features_matrix.ndim > 2:
        features_matrix = features_matrix.reshape(features_matrix.shape[0], -1)
        
    dummy_labels = np.random.randint(0, 2, size=(features_matrix.shape[0],))

    X_train, X_test, y_train, y_test = train_test_split(
        features_matrix, 
        dummy_labels, 
        test_size=0.20, 
        random_state=42
    )

    trained_model = run_ml_pipeline(X_train, X_test, y_train, y_test)