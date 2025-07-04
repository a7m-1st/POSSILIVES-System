from jamaibase import JamAI, protocol as p
from dotenv import load_dotenv
import os

load_dotenv()

jamai = JamAI(token=os.getenv("JAMAI_TOKEN"), project_id=os.getenv("JAMAI_PROJECTID"))

# --- Action Table --- #
def response_generator(details, big_5_personality, social_circle, habits, note):
    completion = jamai.table.add_table_rows(
        "action",
        p.RowAddRequest(
            table_id="main-action-table2",
            data=[dict(details=details, big_5_personality=big_5_personality, social_circle=social_circle, habits=habits, note=note)],
            stream=True,
        ),
    )
    
    # Initialize a list to collect the output chunks
    output_chunks = []

    for chunk in completion:
        if chunk.output_column_name != "answer":
            continue
        # Append the chunk text to the list
        output_chunks.append(chunk.text)

    # Combine all the chunks into a single string
    combined_output = ''.join(output_chunks)

    return combined_output
  
  
print (response_generator("I am a 25-year old", "Openness: 0.8, Conscientiousness: 0.5, Extraversion: 0.6, Agreeableness: 0.7, Neuroticism: 0.3", "I have a close-knit group of friends", "I exercise daily", "Generate for me in a loving manner"))