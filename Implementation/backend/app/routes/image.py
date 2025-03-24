from app.aws.s3_client import generate_presigned_profile_photo_url
from fastapi import APIRouter, HTTPException

router = APIRouter()


@router.get("/generate-profile-photo-url/")
async def generate_profile_photo_url(user_id: str):
    try:
        presigned_url, image_url = generate_presigned_profile_photo_url(user_id)
        return {
            "presigned_url": presigned_url,
            "image_url": image_url
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
