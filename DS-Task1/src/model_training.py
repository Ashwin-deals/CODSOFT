"""Train a simple Logistic Regression model on the cleaned Titanic dataset.

Loads `data/processed/cleaned_titanic.csv`, splits into train/test,
trains `LogisticRegression`, then prints accuracy and a confusion matrix.
"""
import os
from pathlib import Path
from typing import Union, Optional

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
import joblib

from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, confusion_matrix, precision_score, recall_score


def train_logistic_regression(
    cleaned_path: Optional[Union[str, Path]] = None,
    test_size: float = 0.2,
    random_state: int = 42,
    save_model: bool = True,
    model_path: Optional[Union[str, Path]] = None,
):
    """Train and evaluate a Logistic Regression model.

    Args:
        cleaned_path: Path to the cleaned CSV produced by `data_cleaning.py`.
        test_size: Fraction of data to reserve for testing.
        random_state: Random seed for reproducibility.

    Returns:
        Tuple of (model, X_test, y_test, y_pred)
    """
    # Build default paths relative to this script so it works from project root
    if cleaned_path is None:
        cleaned_path = os.path.abspath(
            os.path.join(os.path.dirname(__file__), "..", "data", "processed", "cleaned_titanic.csv")
        )

    if model_path is None:
        model_path = os.path.abspath(
            os.path.join(os.path.dirname(__file__), "..", "models", "titanic_model.pkl")
        )

    cleaned_path = Path(cleaned_path)
    model_path = Path(model_path)

    if not cleaned_path.exists():
        raise FileNotFoundError(f"Cleaned data not found: {cleaned_path}")

    df = pd.read_csv(cleaned_path)

    if "Survived" not in df.columns:
        raise ValueError("Expected column 'Survived' in cleaned data")

    # Drop identifier columns if present
    for col in ("PassengerId",):
        if col in df.columns:
            df = df.drop(columns=[col])

    # Separate features and target
    y = df["Survived"].astype(int)
    X = df.drop(columns=["Survived"])

    # Keep only numeric columns (assumes Sex/Embarked already encoded)
    X = X.select_dtypes(include=[np.number])

    # Drop any remaining rows with NaN
    if X.isnull().any().any():
        X = X.fillna(X.median())

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=test_size, random_state=random_state, stratify=y
    )

    model = LogisticRegression(max_iter=500)
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)

    acc = accuracy_score(y_test, y_pred)
    prec = precision_score(y_test, y_pred, zero_division=0)
    rec = recall_score(y_test, y_pred, zero_division=0)
    cm = confusion_matrix(y_test, y_pred)

    print(f"Accuracy: {acc:.4f}")
    print(f"Precision: {prec:.4f}")
    print(f"Recall: {rec:.4f}")
    print("Confusion Matrix:\n", cm)

    # Plot confusion matrix heatmap for clarity
    plt.figure(figsize=(5,4))
    sns.heatmap(cm, annot=True, fmt="d", cmap="Blues", cbar=False)
    plt.xlabel("Predicted")
    plt.ylabel("Actual")
    plt.title("Confusion Matrix")
    plt.show()

    # Save model if requested (ensure model directory exists)
    if save_model:
        model_path.parent.mkdir(parents=True, exist_ok=True)
        joblib.dump(model, model_path)
        print(f"Model saved to: {model_path}")

    return model, X_test, y_test, y_pred


if __name__ == "__main__":
    model, X_test, y_test, y_pred = train_logistic_regression()

    # Final metrics summary
    final_acc = accuracy_score(y_test, y_pred)
    final_prec = precision_score(y_test, y_pred, zero_division=0)
    final_rec = recall_score(y_test, y_pred, zero_division=0)
    print(f"Final Accuracy: {final_acc:.4f}, Precision: {final_prec:.4f}, Recall: {final_rec:.4f}")

    # Example: load saved model and predict for a single passenger
    # (22-year-old male in 3rd class)
    saved_model_path = Path(os.path.join(os.path.dirname(__file__), "..", "models", "titanic_model.pkl")).resolve()
    if saved_model_path.exists():
        loaded = joblib.load(saved_model_path)

        # Build a sample input using the cleaned data's numeric feature columns
        cleaned_csv = Path(os.path.join(os.path.dirname(__file__), "..", "data", "processed", "cleaned_titanic.csv")).resolve()
        if cleaned_csv.exists():
            df_clean = pd.read_csv(cleaned_csv)
            # Drop identifier columns that were removed during training
            df_clean = df_clean.drop(columns=["PassengerId"], errors="ignore")
            feature_cols = df_clean.drop(columns=["Survived"]).select_dtypes(include=[np.number]).columns.tolist()

            # Build a single-row DataFrame with the same columns/order as training features
            sample_vals = {c: 0 for c in feature_cols}
            if "Age" in sample_vals:
                sample_vals["Age"] = 22
            if "Sex" in sample_vals:
                sample_vals["Sex"] = 0
            if "Pclass" in sample_vals:
                sample_vals["Pclass"] = 3

            sample_df = pd.DataFrame([sample_vals], columns=feature_cols)
            pred = loaded.predict(sample_df)
            print("Predicted survival for sample (22yo male, 3rd class):", int(pred[0]))
        else:
            print(f"Cleaned CSV not found for building sample: {cleaned_csv}")
    else:
        print(f"Saved model not found at: {saved_model_path}")
