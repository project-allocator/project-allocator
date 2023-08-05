#!/bin/bash

function count_pods() {
  # Count pods that satisfy the specified conditions.
  # $1 is the name of the Wayfinder component.
  # $2 is the field selector.
  # $3 is an UTC string that filters out pods that are older than the given datetime.
  # All arguments can be left unspecified by passing an empty string.
  selector="${1:+"--selector=app.kubernetes.io/component=$1"}"
  field_selector="${2:+"--field-selector=$2"}"
  # Leave $selector and $field_selector unquoted.
  kubectl get pods $selector $field_selector --output json \
    | jq --arg s "${3:-'1970-01-01T00:00:00Z'}" '[.items[] | select(.metadata.creationTimestamp > $s)] | length'
}
