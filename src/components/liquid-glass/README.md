# Liquid Glass optical map

The standard displacement map and implementation approach are adapted from
[`rdev/liquid-glass-react`](https://github.com/rdev/liquid-glass-react), source
snapshot `ac48eab18d1f7f444ae30002d240cae29c863a21`, under the MIT license included
in this directory.

PortfolioX uses the map only in the Keshi page-scoped `KeshiLiquidGlass`
component. The production component removes elastic geometry deformation and
uses slow pointer-following reflection.
