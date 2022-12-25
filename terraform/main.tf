terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.0"
    }
  }
}

provider "aws" {
  region = "us-west-2"
}

# todo: migrate actual prod configuration over
resource "aws_s3_bucket" "pill-city" {
  bucket = "pill-city-dev"
}

resource "aws_s3_bucket_acl" "pill-city" {
  bucket = aws_s3_bucket.pill-city.id
  acl = "private"
}

resource "aws_iam_user" "pill-city-admin" {
  name = "pill-city-dev-admin"
}

resource "aws_iam_access_key" "pill-city-admin-secret" {
  user = aws_iam_user.pill-city-admin.name
}

resource "aws_iam_user_policy" "pill-city-admin-user-policy" {
  name = "pill-city-dev-admin-user-policy"
  user = aws_iam_user.pill-city-admin.name

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

resource "aws_cloudfront_public_key" "pill-city" {
  name = "pill-city-dev"
  encoded_key = file("public_key.pem")
}

resource "aws_cloudfront_key_group" "pill-city" {
  name = "pill-city-dev"
  items = [aws_cloudfront_public_key.pill-city.id]
}

locals {
  cf_s3_origin_id = "PillCity"
}

resource "aws_cloudfront_distribution" "pill-city" {
  origin {
    domain_name = aws_s3_bucket.pill-city.bucket_regional_domain_name
    origin_id = local.cf_s3_origin_id
  }

  enabled = true
  default_cache_behavior {
    allowed_methods = ["GET", "HEAD"]
    cached_methods = ["GET", "HEAD"]
    target_origin_id = local.cf_s3_origin_id
    trusted_key_groups = [aws_cloudfront_key_group.pill-city.id]
    viewer_protocol_policy = "redirect-to-https"
    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }
  }
  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }
  viewer_certificate {
    cloudfront_default_certificate = true
  }

  price_class = "PriceClass_100"
}
