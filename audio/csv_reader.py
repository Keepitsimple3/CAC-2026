import csv
import os

csv_folder = "ml_folder"
csv_file = "ml_dataset.csv"
csv_path = os.path.join(csv_folder, csv_file)



def csvReader():
    with open(csv_path, mode="r", encoding='utf-8') as file:
        csv_reader = csv.reader(file)
        header = next(csv_reader)

        for row in csv_reader:
            pass

def soundfilReader():
    print(1)

