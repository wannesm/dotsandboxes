#!/usr/bin/env python3
# encoding: utf-8
"""
demo_start

Starts a server and a number of AI agents that play the game.

The agents are developed as part of the Machine Learning: Project course
at KU Leuven by Prof. Hendrik Blockeel and Dr. Wannes Meert.

The agents available are developed by:

- Joa Oris
- Birthe van den Berg
- Wouter Baert and Stijn Caerts

The demo agents are available upon request: wannes.meert@cs.kuleuven.be .

Created by Wannes Meert on 2018-10-04
Copyright (c) 2018 KU Leuven. All rights reserved.
"""

import sys
import argparse
import logging
import subprocess as sp
from pathlib import Path
import threading


logger = logging.getLogger(__name__)
here = Path(__file__).parent
agents_path = here / "agents"
agent_threads = []
server_thread = None
server_port = 8810
cur_port = 8811


def agent(func):
    global cur_port
    new_port = cur_port
    cur_port += 1
    def func2():
        return func(new_port)
    t = threading.Thread(target=func2)
    agent_threads.append(t)
    return func2


@agent
def start_agent_oris(port):
    script_loc = agents_path / "agent_oris"
    logger.info("Starting agent Oris on:\n==> ws://localhost:{}".format(port))
    cmd = ["java", "-jar", "dotsandboxes.jar", str(port)]
    logger.info(" ".join(cmd))
    sp.run(cmd, cwd=str(script_loc))


@agent
def start_agent_vandenberg(port):
    script_loc = agents_path / "agent_vandenberg"
    logger.info("Starting agent van den Berg on:\n==> ws://localhost:{}".format(port))
    cmd = ["python3", "dotsandboxesagent.py", str(port)]
    logger.info(" ".join(cmd) + " -- cwd = {}".format(script_loc))
    sp.run(cmd, cwd=str(script_loc))


@agent
def start_agent_baert_caerts(port):
    script_loc = agents_path / "agent_baert_caerts" / "runnable_agent"
    logger.info("Starting agent Baert & Caerts on:\n==> ws://localhost:{}".format(port))
    cmd = ["java", "-jar", "agent.jar", "-p", str(port)]
    logger.info(" ".join(cmd))
    sp.run(cmd, cwd=str(script_loc))


def start_agents():
    for agent_thread in agent_threads:
        agent_thread.start()


def start_server():
    global server_thread
    def start_server_inner():
        logger.info("Start server on:\n==> http://localhost:{}/demo".format(server_port))
        cmd = ["python3", "dotsandboxesserver.py", str(server_port)]
        logger.info(" ".join(cmd))
        sp.run(cmd)
    server_thread = threading.Thread(target=start_server_inner)
    server_thread.start()


def main(argv=None):
    parser = argparse.ArgumentParser(description='Perform some task')
    parser.add_argument('--verbose', '-v', action='count', default=0, help='Verbose output')
    parser.add_argument('--quiet', '-q', action='count', default=0, help='Quiet output')
    # parser.add_argument('--flag', '-f', action='store_true', help='Flag help')
    # parser.add_argument('--output', '-o', required=True, help='Output file')
    # parser.add_argument('--version', action='version', version='%(prog)s 1.0')
    # parser.add_argument('input', nargs='+', help='List of input files')
    args = parser.parse_args(argv)

    logger.setLevel(max(logging.INFO - 10 * (args.verbose - args.quiet), logging.DEBUG))
    logger.addHandler(logging.StreamHandler(sys.stdout))

    start_agents()
    start_server()


if __name__ == "__main__":
    sys.exit(main())

