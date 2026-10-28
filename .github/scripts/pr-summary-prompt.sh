#!/usr/bin/env bash
# Builds the prompt for the PR summary from the checked-out pull request merge commit.
# Usage: pr-summary-prompt.sh <output-file>   (env: PR_TITLE, BASE_REF)
set -euo pipefail

out="$1"
max_diff_bytes=60000 # Copilot CLI receives the prompt as one argument (Linux limit: 128 KB)

# On pull_request events HEAD is the merge commit; its first parent is the target branch.
base="HEAD^1"
exclude=(-- . ':(exclude)yarn.lock' ':(exclude)**/*.snap')

diff_file="$(mktemp)"
git diff "$base" HEAD "${exclude[@]}" > "$diff_file"
diff_size="$(wc -c < "$diff_file" | tr -d ' ')"

{
  echo "Pull request title: ${PR_TITLE}"
  echo "Target branch: ${BASE_REF}"
  echo
  echo "Changed files:"
  git diff --stat "$base" HEAD
  echo
  if [ "$diff_size" -gt "$max_diff_bytes" ]; then
    echo "Diff (yarn.lock excluded; truncated to the first ${max_diff_bytes} of ${diff_size} bytes):"
  else
    echo "Diff (yarn.lock excluded):"
  fi
  echo '```diff'
  head -c "$max_diff_bytes" "$diff_file"
  echo
  echo '```'
} > "$out"

rm -f "$diff_file"
echo "Prompt written to $out ($(wc -c < "$out" | tr -d ' ') bytes)"
