module.exports = {
    /**
     * Application configuration section
     * http://pm2.keymetrics.io/docs/usage/application-declaration/
     */
    apps : [
      {
        name      : 'my_react_app',
        script    : 'npm',
        args      : 'run start:production',
        env_production : {
          NODE_ENV: 'production'
        }
      },
    ],
  
    /**
     * Deployment section
     * http://pm2.keymetrics.io/docs/usage/deployment/
     */
    deploy : {
      production : {},
      staging: {
        user: 'your-user',
        host: 'your-server',
        ref: 'origin/master',
        repo: 'https://github.com/HomeLend/homelend-fronted.git',
        path: '/home/homelend/homelend-fronted',
        key: '/absolute/path/to/key',
        ssh_options: ['ForwardAgent=yes'],
        'post-deploy': 'npm install && pm2 reload ecosystem.config.js --env production'
      },
      dev : {}
    }
  };