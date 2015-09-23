var configPaths = require('./the-configs');

exports.json = {
  property: "value",
  object: {
    property: "value",
    array: [ 1, 2, 3 ]
  }
};

exports.yaml = {
  property: "value",
  object: {
    property: "value",
    array: [ 1, 2, 3 ]
  }
};

exports.xml = {
  xml: [
    {
      object: [
        {
          elementList: [
            {
              element: [1, 2, 3]
            }
          ],
          property: [ "value" ]
        }
      ],
      property: [ "value" ]
    }
  ]
};

exports.properties = {
  property1: "value1",
  property2: "value2",
  array: "1, 2, 3"
};
