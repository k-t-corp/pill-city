# todo: migrate actual prod configuration over
resource "aws_s3_bucket" "pill-city" {
  bucket = "pill-city"
  acl = "private"
}

resource "aws_s3_bucket_policy" "pill-city" {
  bucket = aws_s3_bucket.pill-city.id

  policy = jsonencode({
    "Version": "2012-10-17",
    "Statement": [
      {
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

resource "aws_iam_user" "pill-city-stsadmin" {
  name = "stsadmin"
}

resource "aws_iam_access_key" "pill-city-stsadmin-secret" {
  user = aws_iam_user.pill-city-stsadmin.name
}

resource "aws_iam_user_policy" "pill-city-stsadmin-user-policy" {
  name = "stsadmin-user-policy"
  user = aws_iam_user.pill-city-stsadmin.name

  policy = jsonencode({
    Version: "2012-10-17"
    Statement: [
      {
        Action: [
          "s3:GetObject",
          "s3:PutObject",
          "s3:AbortMultipartUpload",
          "s3:DeleteObject"
        ],
        Effect: "Allow",
        Resource: [
          "arn:aws:s3:::pill-city/*"
        ]
      }
    ]
  })
}

resource "aws_iam_role" "pill-city-media-reader" {
  name = "media-reader"

  assume_role_policy = jsonencode({
    Version: "2012-10-17"
    Statement: [
      {
        Action: "sts:AssumeRole"
        Effect: "Allow"
        Principal: {
          "AWS": aws_iam_user.pill-city-stsadmin.arn
        }
      },
    ]
  })

  inline_policy {
    name = "media-reader-policy"
    policy = jsonencode({
      Version: "2012-10-17"
      Statement: [
        {
          Action: "s3:GetObject"
          Effect: "Allow"
          Resource: [
            "arn:aws:s3:::pill-city/media/*"
          ]
        }
      ]
    })
  }

  max_session_duration = 43200
}
