# app/aws/s3_client.py
import os
import boto3
from dotenv import load_dotenv
from typing import Tuple
import uuid

load_dotenv()

AWS_ACCESS_KEY = os.getenv("AWS_ACCESS_KEY")
AWS_SECRET_KEY = os.getenv("AWS_SECRET_KEY")
AWS_BUCKET_NAME = os.getenv("AWS_BUCKET_NAME")
AWS_REGION = os.getenv("AWS_REGION")

s3_client = boto3.client(
    "s3",
    aws_access_key_id=AWS_ACCESS_KEY,
    aws_secret_access_key=AWS_SECRET_KEY,
    region_name=AWS_REGION,
)

# s3_client.py
def generate_presigned_profile_photo_url(user_id: str) -> Tuple[str, str]:
    try:
        object_key = f"users/{user_id}/profile.jpg"
        image_url = f"https://{AWS_BUCKET_NAME}.s3.{AWS_REGION}.amazonaws.com/{object_key}"

        presigned_url = s3_client.generate_presigned_url(
            "put_object",
            Params={
                "Bucket": AWS_BUCKET_NAME,
                "Key": object_key,
                "ContentType": "image/jpeg"
                # ❗ DO NOT ADD ACL HERE
            },
            ExpiresIn=3600
        )

        return presigned_url, image_url

    except Exception as e:
        print("Error generating presigned URL:", e)
        raise
