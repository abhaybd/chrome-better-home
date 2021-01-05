#!/bin/bash
INLINE_RUNTIME_CHUNK=false npm run build
cp -R build ../extension/