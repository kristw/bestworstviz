# bestworstviz [![Dependency Status][daviddm-image]][daviddm-url]

The code behind this award-winning terrible visualization design :joy:
http://www.visualisingdata.com/2016/04/bestworstviz-contest-result/

Read more about it from this [blog post](https://medium.com/@kristw/how-i-carefully-crafted-a-terrible-visualization-2c8e06d50ebb#.bk05zmhmy)

![WTF Vis](http://www.visualisingdata.com/wp-content/uploads/2016/04/BestWorstViz1-600x440.png)

## Development

### Run

To run in development mode

```
gulp
```

See your site at [localhost:7000](http://localhost:7000). It will automagically refresh when you change the code (via browsersync).

To run in production mode

```
gulp --production
```

### Test

Run this command to test once.

```
gulp test
```

Or run this command to test and retest when files are changed.

```
gulp tdd
```

Test coverage will be generated to ```coverage``` directory.

## License

© 2016 [Krist Wongsuphasawat](http://kristw.yellowpigz.com)  ([@kristw](https://twitter.com/kristw)) Apache-2.0 License

[travis-image]: https://travis-ci.org/kristw/bestworstviz.svg?branch=master
[travis-url]: https://travis-ci.org/kristw/bestworstviz
[daviddm-image]: https://david-dm.org/kristw/bestworstviz.svg?theme=shields.io
[daviddm-url]: https://david-dm.org/kristw/bestworstviz