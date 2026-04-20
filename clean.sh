#!/bin/bash

# The MIT License (MIT)
#
# Copyright (c) 2025 Che-Hung Lin
#
# Permission is hereby granted, free of charge, to any person obtaining a copy
# of this software and associated documentation files (the "Software"), to deal
# in the Software without restriction, including without limitation the rights
# to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
# copies of the Software, and to permit persons to whom the Software is
# furnished to do so, subject to the following conditions:
#
# The above copyright notice and this permission notice shall be included in
# all copies or substantial portions of the Software.
#
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
# IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
# FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
# AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
# LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
# OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
# THE SOFTWARE.

# Service and Image Definitions
SVC_FRONTEND="hub-ui"
IMG_FRONTEND="hub-ui"

# Exit immediately if a command exits with a non-zero status.
set -euo pipefail

clean_all() {
  echo "Stopping and removing Docker containers and networks..."
  # Use docker-compose down to stop and remove containers and networks.
  # The --remove-orphans flag cleans up any containers not defined in the compose file.
  # The || true prevents the script from exiting if the containers don't exist.
  docker-compose down --remove-orphans || true
  echo "Stopping and removing Docker containers and networks...done!"

  echo "Removing Docker images..."
  docker image rm ${IMG_FRONTEND} 2>/dev/null || true
  echo "Removing Docker images...done!"
}

clean_ui() {
  echo "Stopping and removing UI container..."
  docker-compose rm -s -f -v ${SVC_FRONTEND} || true
  echo "Removing UI image..."
  docker image rm ${IMG_FRONTEND} 2>/dev/null || true
  echo "Clean UI done."
}

if [ $# -eq 0 ]; then
  set -- "all"
fi

DO_ALL=false
DO_UI=false

for arg in "$@"; do
  case "${arg}" in
    ui) DO_UI=true ;;
    all) DO_ALL=true ;;
    help)
      echo "Usage: $0 {ui|all|help} [more args...]"
      exit 0
      ;;
    *)
      echo "Unknown argument: ${arg}"
      echo "Usage: $0 {ui|all|help} [more args...]"
      exit 1
      ;;
  esac
done

if [[ "${DO_ALL}" == "true" ]]; then
  clean_all
else
  if [[ "${DO_UI}" == "true" ]]; then
    clean_ui
  fi
fi

exit 0
