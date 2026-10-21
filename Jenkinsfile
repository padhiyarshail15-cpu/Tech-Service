// Runs a shell command with the Node version from .nvmrc (installed if missing)
def nvmSh(String cmd) {
  sh """#!/bin/bash
set -e
export NVM_DIR="\$HOME/.nvm"
. "\$NVM_DIR/nvm.sh"
nvm install >/dev/null
nvm use >/dev/null
${cmd}
"""
}

pipeline {
  agent any

  options {
    disableConcurrentBuilds()
    timestamps()
    timeout(time: 20, unit: 'MINUTES')
  }

  environment {
    CI = 'true'
  }

  stages {
    stage('Install') {
      steps {
        nvmSh '''
          node -v
          corepack enable
          yarn install --immutable
        '''
      }
    }

    stage('Lint') {
      steps {
        nvmSh 'yarn lint'
      }
    }

    stage('Build') {
      when { not { branch 'main' } }
      steps {
        nvmSh 'yarn build'
      }
    }

    stage('Deploy to Vercel (main)') {
      when { branch 'main' }
      environment {
        VERCEL_TOKEN      = credentials('vercel-token')
        VERCEL_ORG_ID     = credentials('vercel-org-id')
        VERCEL_PROJECT_ID = credentials('vercel-project-id')
      }
      steps {
        nvmSh '''
          npx --yes vercel pull --yes --environment=production --token="$VERCEL_TOKEN"
          npx --yes vercel build --prod --token="$VERCEL_TOKEN"
          npx --yes vercel deploy --prebuilt --prod --token="$VERCEL_TOKEN"
        '''
      }
    }
  }

  post {
    always {
      cleanWs()
    }
  }
}
