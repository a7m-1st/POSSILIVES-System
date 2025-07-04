from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch

local_model_path = "./local_model"
tokenizer = AutoTokenizer.from_pretrained(local_model_path)
model = AutoModelForSequenceClassification.from_pretrained(local_model_path)


def personality_detection(text, threshold=0.05, endpoint=1.0):
    inputs = tokenizer(text, truncation=True, padding=True, return_tensors="pt")
    outputs = model(**inputs)
    predictions = outputs.logits.squeeze().detach().numpy()

    # Apply sigmoid to squash between 0 and 1
    probabilities = torch.sigmoid(torch.tensor(predictions))
    probabilities[probabilities < threshold] = 0.05
    probabilities[probabilities > endpoint] = 1.0

    label_names = ['Agreeableness', 'Conscientiousness', 'Extraversion', 'Neuroticism', 'Openness']
    result = {label_names[i]: f"{probabilities[i] * 100:.0f}%" for i in range(len(label_names))}

    return result