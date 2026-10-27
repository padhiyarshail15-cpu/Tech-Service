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

  parameters {
    // Lets you run the pipeline before SonarQube Cloud is set up in Jenkins
    booleanParam(name: 'RUN_SONAR', defaultValue: true, description: 'Run SonarQube Cloud analysis and Quality Gate')
  }

  environment {
    CI = 'true'
    HUSKY = '0' // git hooks are for developer machines, not CI
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
        nvmSh '''
          yarn lint
          yarn lint:report
        '''
      }
    }

    stage('Format Check') {
      steps {
        nvmSh 'yarn format:check'
      }
    }

    stage('Typecheck') {
      steps {
        nvmSh 'yarn typecheck'
      }
    }

    stage('Unit Tests + Coverage') {
      steps {
        // coverage/lcov.info is consumed by SonarQube; reports/junit.xml by Jenkins
        nvmSh 'yarn test:coverage --reporter=default --reporter=junit --outputFile.junit=reports/junit.xml'
      }
      post {
        always {
          junit allowEmptyResults: true, testResults: 'reports/junit.xml'
        }
      }
    }

    stage('SonarQube Cloud Analysis + Quality Gate') {
      when { expression { params.RUN_SONAR != false } }
      steps {
        script {
          // Names must match: Manage Jenkins -> Tools ('sonar-scanner') and -> System ('sonarcloud')
          def scannerHome = tool 'sonar-scanner'
          withSonarQubeEnv('sonarcloud') {
            // sonar.qualitygate.wait: the scanner polls SonarQube Cloud for the Quality Gate
            // and exits non-zero if it fails. Used instead of waitForQualityGate because
            // SonarQube Cloud's Free plan does not send webhooks.
            // sonar.projectVersion = latest release tag (vX.Y.Z created by semantic-release), so the
            // "Previous version" new-code period restarts after each release. Do NOT use the
            // build number: every build would start a new period and a re-run would pass the gate.
            // Run inside nvmSh so the JS/TS analyzer finds Node on PATH.
            withEnv(["SONAR_SCANNER_HOME=${scannerHome}"]) {
              nvmSh '''
                git fetch --tags --force --quiet origin || true
                VERSION="$(git describe --tags --abbrev=0 --match 'v[0-9]*' 2>/dev/null | sed 's/^v//')"
                VERSION="${VERSION:-0.0.0}"
                echo "Sonar project version: $VERSION"
                "$SONAR_SCANNER_HOME/bin/sonar-scanner" \
                  -Dsonar.projectVersion="$VERSION" \
                  -Dsonar.qualitygate.wait=true \
                  -Dsonar.qualitygate.timeout=300
              '''
            }
          }
        }
      }
    }

    stage('Build') {
      when { not { branch 'main' } }
      steps {
        nvmSh 'yarn build'
      }
    }

    stage('Release (main)') {
      when { branch 'main' }
      environment {
        // GitHub token (Contents, Issues, Pull requests: read & write): pushes the vX.Y.Z tag,
        // creates the GitHub Release and comments on the released PRs
        GH_TOKEN = credentials('github-token')
      }
      steps {
        // Reads Conventional Commits since the last tag: fix -> patch, feat -> minor, BREAKING CHANGE -> major.
        // Does nothing if there are no releasable commits (e.g. only chore/docs/test).
        nvmSh 'yarn release'
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
      archiveArtifacts artifacts: 'coverage/**, reports/**', allowEmptyArchive: true
      cleanWs()
    }
  }
}
