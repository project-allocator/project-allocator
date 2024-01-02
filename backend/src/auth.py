import os
from dotenv import load_dotenv
from fastapi_azure_auth import SingleTenantAzureAuthorizationCodeBearer

load_dotenv()
TENANT_ID = os.environ.get("TENANT_ID")
APP_CLIENT_ID = os.environ.get("APP_CLIENT_ID")
OPENAPI_CLIENT_ID = os.environ.get("OPENAPI_CLIENT_ID")

azure_scheme = SingleTenantAzureAuthorizationCodeBearer(
    app_client_id=APP_CLIENT_ID,
    tenant_id=TENANT_ID,
    scopes={
        # Key is the scope name, value is the description.
        f"api://{APP_CLIENT_ID}/user_impersonation": "User impersonation",
        "User.Read": "Read user profile",
        "Mail.Send": "Send mail as user",
    },
)

swagger_scheme = {
    "swagger_ui_oauth2_redirect_url": "/oauth2-redirect",
    "swagger_ui_init_oauth": {
        "usePkceWithAuthorizationCodeGrant": True,
        "clientId": OPENAPI_CLIENT_ID,
    },
}
