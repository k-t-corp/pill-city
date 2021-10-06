terraform {
  required_providers {
    mongodbatlas = {
      source = "mongodb/mongodbatlas"
      version = "0.9.0"
    }

    heroku = {
      source = "heroku/heroku"
      version = "4.6.0"
    }

    aws = {
      source = "hashicorp/aws"
      version = "3.52.0"
    }
  }
}

provider "mongodbatlas" {
  public_key = var.atlas_public_key
  private_key  = var.atlas_private_key
}

provider "heroku" {
  email = var.heroku_email
  api_key = var.heroku_api_key
}

provider "aws" {
  region = "us-west-2"
  access_key = var.aws_access_key
  secret_key = var.aws_secret_key
}