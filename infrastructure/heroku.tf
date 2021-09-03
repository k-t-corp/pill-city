data "heroku_app" "app" {
  name = var.heroku_app_name
}

resource "heroku_config" "app-config" {
  sensitive_vars = {
    MONGODB_URI = local.mongodb_rw_connection_string
    S3_ENDPOINT_URL = "https://s3.us-west-2.amazonaws.com"
    STS_ENDPOINT_URL = "https://sts.us-west-2.amazonaws.com"
    AWS_REGION = "us-west-2"
    AWS_ACCESS_KEY = aws_iam_access_key.stsadmin-secret.id
    AWS_SECRET_KEY = aws_iam_access_key.stsadmin-secret.secret
    S3_BUCKET_NAME = "pill-city"
    MEDIA_READER_ROLE_ARN = aws_iam_role.media-reader.arn
    # TODO: use cloudfront
    CDN_URL = "https://pill-city.s3.us-west-2.amazonaws.com"
  }
}

resource "heroku_app_config_association" "app-config-association" {
  app_id = data.heroku_app.app.id

  sensitive_vars = heroku_config.app-config.sensitive_vars
}

// todo: add actual heroku app