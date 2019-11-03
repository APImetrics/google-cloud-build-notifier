module.exports = {
    "extends": [
        "airbnb-base",
        // "plugin:vue/recommended"
    ],
    "env": {
        "browser": false,
    },
    rules: {
        'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
        'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    },
};