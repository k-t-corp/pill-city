resource "aws_s3_bucket" "s3-bucket" {
  bucket = "pill-city"
  acl = "private"
}

resource "aws_s3_bucket_policy" "s3-bucket-policy" {
  bucket = aws_s3_bucket.s3-bucket.id

  policy = jsonencode({
    "Version": "2012-10-17",
    "Statement": [
      {
        Sid: "",
        Effect: "Allow",
        Principal: "*",
        Action: [
          "s3:GetObject",
          "s3:GetObjectVersion"
        ],
        Resource: [
          "arn:aws:s3:::pill-city/avatars/*"
        ]
      }
    ]
  })
}

resource "aws_iam_user" "stsadmin" {
  name = "stsadmin"
}

resource "aws_iam_access_key" "stsadmin-secret" {
  user = aws_iam_user.stsadmin.name
}

resource "aws_iam_user_policy" "stsadmin-user-policy" {
  name = "stsadmin-user-policy"
  user = aws_iam_user.stsadmin.name

  policy = <<EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Action": [
                "s3:GetObject",
                "s3:PutObject",
                "s3:AbortMultipartUpload"
            ],
            "Effect": "Allow",
            "Resource": [
                "arn:aws:s3:::pill-city/*"
            ],
            "Sid": ""
        }
    ]
}
EOF
}

resource "aws_iam_role" "media-reader" {
  name = "media-reader"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Resource = aws_iam_user.stsadmin.arn
      },
    ]
  })

  inline_policy {
    name = "media-reader-policy"
    policy = <<EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Action": [
                "s3:GetObject",
            ],
            "Effect": "Allow",
            "Resource": [
                "arn:aws:s3:::pill-city/media/*"
            ],
            "Sid": ""
        }
    ]
}
EOF
  }
}
