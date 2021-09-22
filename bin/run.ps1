#!/usr/bin/env pwsh

$basedir = Split-Path $MyInvocation.MyCommand.Definition -Parent

& node "$basedir/run.js" $args
