#!/usr/bin/env python3
# encoding: utf-8
"""
dotsandboxesserver.py

Template for the Machine Learning Project course at KU Leuven (2017-2018)
of Hendrik Blockeel and Wannes Meert.

Copyright (c) 2018 KU Leuven. All rights reserved.
"""

import sys
import argparse
import logging
import http.server
import socketserver
import json

logger = logging.getLogger(__name__)


class RequestHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path == "/demo":
            self.send_response(302)
            self.send_header("Location", "/static/demo.html")
            self.end_headers()
        elif self.path == "/":
            self.send_response(302)
            self.send_header("Location", "/static/dotsandboxes.html")
            self.end_headers()
        return super().do_GET()

    def do_PUT(self):
        response = {
            'result': 'ok'
        }
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps(response).encode())


def start_server(port):
    httpd = socketserver.TCPServer(("", port), RequestHandler)
    print("Running on http://127.0.0.1:{}".format(port))
    httpd.serve_forever()


def main(argv=None):
    parser = argparse.ArgumentParser(description='Start server to play Dots and Boxes')
    parser.add_argument('--verbose', '-v', action='count', default=0, help='Verbose output')
    parser.add_argument('--quiet', '-q', action='count', default=0, help='Quiet output')
    parser.add_argument('port', metavar='PORT', type=int, help='Port to use for server')
    args = parser.parse_args(argv)

    logger.setLevel(max(logging.INFO - 10 * (args.verbose - args.quiet), logging.DEBUG))
    logger.addHandler(logging.StreamHandler(sys.stdout))

    start_server(args.port)


if __name__ == "__main__":
    sys.exit(main())
