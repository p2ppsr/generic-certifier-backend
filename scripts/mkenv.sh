#!/bin/bash

echo "Creating $1"
echo "apiVersion: serving.knative.dev/v1
kind: Service
metadata:
  name: $SERVICE
spec:
  template:
    spec:
      timeoutSeconds: 3540
      containers:
      - image: $IMAGE
        env:" > $1

echo "Appending environment variables to $1"
perl -E'
  say "        - name: $_
          value: \x27$ENV{$_}\x27" for @ARGV;
' NODE_ENV \
    SERVER_PRIVATE_KEY \
    HOSTING_DOMAIN \
    ROUTING_PREFIX \
    CERTIFICATE_TYPE_ID \
    DOJO_URL \
    PERSONA_TOKEN \
    NANOSTORE_URL \
    GENERIC_CERT_DB_CONNECTION >> $1

echo "Built! Contents of $1:"
cat $1
