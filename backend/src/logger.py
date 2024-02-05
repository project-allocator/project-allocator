import datetime
import json
import time
from logging import DEBUG, getLogger
from logging.handlers import RotatingFileHandler
from os.path import abspath, dirname
from typing import Callable

from fastapi import Request, Response
from fastapi.routing import APIRoute

LOGGER_DIR = f"{dirname(dirname(abspath(__file__)))}/logs"

handler = RotatingFileHandler(f"{LOGGER_DIR}/app.log", maxBytes=16 * 1024**2, backupCount=10)
handler.setLevel(DEBUG)

logger = getLogger(__name__)
logger.addHandler(handler)
logger.setLevel(DEBUG)


# Custom logger for FastAPI inspired by:
# https://stackoverflow.com/questions/64115628/get-starlette-request-body-in-the-middleware-context
class LoggerRoute(APIRoute):
    def get_route_handler(self) -> Callable:
        original_route_handler = super().get_route_handler()

        async def route_handler(request: Request) -> Response:
            # Measure response time of the original route handler.
            before = time.time()
            response = await original_route_handler(request)
            after = time.time()
            request_time = round(after - before, 4)

            record = {}
            time_local = datetime.datetime.fromtimestamp(before)
            record["time_local"] = time_local.strftime("%Y/%m/%d %H:%M:%S%Z")
            request_body = await request.body()
            record["request_body"] = request_body.decode("utf-8") if request_body else ""
            # Exclude sensitive header information from the log.
            # fmt: off
            record["request_headers"] = {key: value for key, value in request.headers.items() if key not in ["authorization", "x-graph-token"]}
            record["remote_addr"] = request.client.host
            record["request_uri"] = request.url.path
            record["request_method"] = request.method
            record["request_time"] = str(request_time)
            record["status"] = response.status_code
            record["response_body"] = response.body.decode("utf-8")
            record["response_headers"] = {key: value for key, value in response.headers.items()}

            logger.info(json.dumps(record))

            return response

        return route_handler
