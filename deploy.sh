gcloud functions deploy subscribeSlack \
    --trigger-topic cloud-builds \
    --runtime nodejs10 \
    --set-env-vars "SLACK_WEBHOOK_URL=https://hooks.slack.com/…" \
    --project apimetrics-qc
