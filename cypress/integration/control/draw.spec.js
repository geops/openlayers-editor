import DrawControl from '../../../src/control/draw';

describe('Draw control', function () {

  it('should instantiate', function () {
    const draw = new DrawControl({});
    expect(draw).to.be.instanceOf(DrawControl)
  });

  it('should draw points per default', function () {
    const draw = new DrawControl({});
    expect(draw.title).to.equal('Draw Point');
  });

  it('should draw LineStrings.', function () {
    const draw = new DrawControl({ type: 'LineString' });
    expect(draw.title).to.equal('Draw LineString');
  });

  it('should draw Polygons.', function () {
    const draw = new DrawControl({ type: 'Polygon' });
    expect(draw.title).to.equal('Draw Polygon');
  });

});
