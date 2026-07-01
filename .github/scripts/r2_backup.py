#!/usr/bin/env python3
"""Envoie le dernier dump PostgreSQL vers Cloudflare R2, puis supprime
les sauvegardes plus vieilles que RETENTION_DAYS (rotation)."""
import datetime
import os

import boto3
from botocore.config import Config

endpoint = os.environ["R2_ENDPOINT"]
bucket = os.environ["R2_BUCKET"]
retention = int(os.environ.get("RETENTION_DAYS", "30"))
backup_file = os.environ["BACKUP_FILE"]  # posé par l'étape précédente via $GITHUB_ENV
prefix = "daily/"

s3 = boto3.client(
    "s3",
    endpoint_url=endpoint,
    aws_access_key_id=os.environ["AWS_ACCESS_KEY_ID"],
    aws_secret_access_key=os.environ["AWS_SECRET_ACCESS_KEY"],
    config=Config(signature_version="s3v4", region_name="auto"),
)

# 1) Upload de la sauvegarde du jour
key = prefix + os.path.basename(backup_file)
s3.upload_file(backup_file, bucket, key)
print(f"✓ Envoyé sur R2 : {key}")

# 2) Rotation : suppression des sauvegardes trop anciennes
cutoff = datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(days=retention)
paginator = s3.get_paginator("list_objects_v2")
deleted = kept = 0
for page in paginator.paginate(Bucket=bucket, Prefix=prefix):
    for obj in page.get("Contents", []):
        if obj["LastModified"] < cutoff:
            s3.delete_object(Bucket=bucket, Key=obj["Key"])
            print(f"  - purgé : {obj['Key']}")
            deleted += 1
        else:
            kept += 1
print(f"✓ Rétention {retention}j — conservées : {kept}, purgées : {deleted}")
