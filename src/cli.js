#!/usr/bin/env node
const {
  examplesDecorator,
  middlewaresDecorator
} = require('./decorators')
const {
  manifestMiddleware,
  moduleMiddleware
} = require('./middleware')
const {
  findProjectRoot
} = require('./util')
const createConfig = require('./helpers/config')
const ConsoleReporter = require('./reporters/ConsoleReporter')

const MIDDLEWARES = [
  manifestMiddleware,
  moduleMiddleware
]

const DECORATORS = [
  examplesDecorator,
  middlewaresDecorator(MIDDLEWARES)
]

// Set up commands
const cmd = require('yargs')
  .commandDir('./commands', {
    visit: (cmd) => {
      // Decorates the command with new aspects (does not touch `argv`)
      cmd = DECORATORS.reduce(
        (innerCmd, decorator) => decorator(innerCmd),
        cmd
      )

      return cmd
    }
  })

// Configure CLI behaviour
cmd.demandCommand()

// Set global options
cmd.option('silent', {
  description: 'Silence output to terminal',
  default: false
})
cmd.option('cwd', {
  description: 'The project working directory',
  default: () => {
    try {
      return findProjectRoot()
    } catch (_) {
      return process.cwd()
    }
  }
})
cmd.option('config', {
  description: 'The configuration file to use',
  default: null,
  coerce: (configPath) => {

    return configPath
      ? createConfig(configPath)
      : createConfig()
  }
})
cmd.option('network', {
  description: 'The network to operate on',
  default: 'rinkeby'
})

cmd.option('apm.ipfs.rpc', {
  description: 'An URI to the IPFS node used to publish files',
  default: {
    host: 'ipfs.aragon.network',
    protocol: 'http',
    port: 5001
  }
})
cmd.group('apm.ipfs.rpc', 'APM providers:')

// Ethereum
cmd.option('eth-rpc', {
  description: 'An URI to the Ethereum node used for RPC calls',
  default: 'http://localhost:8545'
})

// Add epilogue
cmd.epilogue('For more information, check out https://wiki.aragon.one')

// Run
const reporter = new ConsoleReporter()
cmd.fail((msg, err, a) => {
  reporter.error((err && err.message) || msg || 'An error occurred')
  reporter.debug(err && err.stack)
  process.exit(1)
}).parse(process.argv.slice(2), {
  reporter
})
