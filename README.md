# stripes-loader

This is a Webpack loader used in stripes-core to pull in components from modules. The configuration you set there to enable modules is actually consumed by this package, as is the module configuration and metadata.

It runs in NodeJS via Webpack when Stripes is being bundled for a tenant and not in any browser.
