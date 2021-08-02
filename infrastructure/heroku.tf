data "heroku_app" "app" {
  name = var.heroku_app_name
}

resource "heroku_config" "app-config" {
  sensitive_vars = {
    MONGODB_URI = local.mongodb_rw_connection_string
  }
}

resource "heroku_app_config_association" "app-config-association" {
  app_id = heroku_app.app.id

  sensitive_vars = heroku_config.app-config.sensitive_vars
}

// todo: add actual heroku app