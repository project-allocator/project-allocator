#!/bin/bash

# Clean pods that satisfy the specified conditions.
# $1 is the name of the Wayfinder component.
# $2 is the field selector.
# All arguments can be left unspecified by passing an empty string.
selector="${1:+"--selector=app.kubernetes.io/component=$1"}"
field_selector="${2:+"--field-selector=$2"}"
# Leave $selector and $field_selector unquoted.
kubectl delete pods $selector $field_selector
