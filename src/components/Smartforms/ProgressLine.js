import React, { Component } from 'react';
import { Container, Row, Col } from 'reactstrap';
import { map } from 'lodash';
import Fa from '@fortawesome/react-fontawesome';
import './ProgressLine.css';

export default class ProgressLine extends Component {
  render () {
    const {stages, currentStage} = this.props;

    return(
      <Container className="progressLine" fluid>
        <Row>
          {map(stages, (v, k) =>
            <Col key={k}>
              {v}
            </Col>
          )}
        </Row>
        <Row>
          {map(stages, (v, k) =>
            <Col key={k} className="lineContainer">
              <div className={`line ${currentStage >= k ? "finished" : ''}`} />
              <div className="ball"><Fa icon="pencil-alt" /></div>
              <div className={`line ${currentStage >= k ? "finished" : ''}`} />
            </Col>
          )}
        </Row>
      </Container>
    )
  }
}