import { useRef, useState } from "react";
import { Accordion, Alert, Button, Col, Form, InputGroup, Row, Table } from "react-bootstrap";
import { Texts, Unit } from "./config";
import ReactMarkdown from "react-markdown";
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import 'katex/dist/katex.min.css' 

let Result=[];
export default function App() {
  const [UnitId,setUnitId] = useState(undefined);
  const [TextId,setTextId] = useState(undefined);
  const [CurrentTextOrder,setCurrentTextOrder] = useState(0);
  const [Validate,setValidate] = useState(false);
  const [Text,setText] = useState(undefined);
  const Answer = useRef();
  const FormElement=useRef();
  
  function changeUnitId(e) {
    setTextId('none');
    setText(undefined);
    setUnitId(e.target.value);
  }

  function changeTextId(e) {
    setTextId(e.target.value);
    setText(Texts[UnitId][e.target.value]['texts'][Math.floor(Math.random() * Texts[UnitId][e.target.value]['texts'].length)]);
    Result=[];
    setCurrentTextOrder(0);
  }

  function createAnswerArea(text) {
    const method = text['method'];
    let option=[];
    if (text['options']) {
      option = text['options'];
    }
    switch (method) {
      case 'text':
        return (
          <Form.Control type="text" ref={Answer} />
        );
        break;
      case 'select':
        return (
          <div ref={Answer}>{ option.map( (opt,idx) =>
            //<Form.Check type="checkbox" className="js-check-answer" value={idx} label={opt} key={opt + idx} />
            <div className="form-check" key={opt+idx}>
                <input className="form-check-input js-check-answer" type="radio" name="answer" value={idx} id={`check-${idx}`} />
                <label className="form-check-label" htmlFor={`check-${idx}`}>
                <ReactMarkdown rehypePlugins={[rehypeKatex]} remarkPlugins={[remarkMath]}>
                  {opt}
                </ReactMarkdown>
                </label>
            </div>
            )}
          </div>
        );
        break;
      case 'check':
        return (
          <div ref={Answer}>{ option.map( (opt,idx) =>
            //<Form.Check type="checkbox" className="js-check-answer" value={idx} label={opt} key={opt + idx} />
            <div className="form-check" key={opt+idx}>
                <input className="form-check-input js-check-answer" type="checkbox" value={idx} id={`check-${idx}`} />
                <label className="form-check-label" htmlFor={`check-${idx}`}>
                <ReactMarkdown rehypePlugins={[rehypeKatex]} remarkPlugins={[remarkMath]}>
                  {opt}
                </ReactMarkdown>
                </label>
            </div>
            )}
          </div>
        );
        break;
    }
  }

  function submitAnswer(e) {
    e.preventDefault();
    if (!Result[CurrentTextOrder]) {
      Result[CurrentTextOrder] = [];
    }
    
    let result = false;
    let answer = "";
    let answer_tmp;
    
    switch (Text[CurrentTextOrder]['method']) {
      case 'text':
        answer = Answer.current.value;
        if (Answer.current.value === Text[CurrentTextOrder]['answer']) {
          result = true;
        }
        break;
      case 'select':
        answer_tmp = FormElement.current.answer.value;
        answer = Text[CurrentTextOrder]['options'][answer_tmp];
        if (Number(answer_tmp) === Number(Text[CurrentTextOrder]['answer'])) {
          result = true;
        }
        break;
      case 'check':
        let options = Answer.current.getElementsByClassName('js-check-answer');
        answer_tmp = [];
        let answer_idx = [];
        for (let i=0; i < options.length ; ++i) {
          if (options[i].checked) {
            answer_idx.push(options[i].value);
            answer_tmp.push(Text[CurrentTextOrder]['options'][options[i].value]);
          }
        }
        answer = answer_tmp.join(', ');
        if (answer_idx.sort().join(', ') === Text[CurrentTextOrder]['answer'].sort().join(', ')) {
          result = true;
        }
        break;
    }

    Result[CurrentTextOrder].push(answer);
    if (result) {
      setCurrentTextOrder(CurrentTextOrder + 1);
    }
    setValidate(!result);
    Answer.current.focus();
    Answer.current.value = "";
  }

  function ConvertAnswer(text) {
    switch (text['method']) {
      case 'text':
        if (text['answerTex']) {
          return `$${text['answer']}$`;
        } else {
          return text['answer'];
        }
        break;
      case 'select':
        return text['options'][text['answer']]
        break;
      case 'check':
        let answer = [];
        for (let i=0; i < text['answer'].length; ++i) {
          answer.push(text['options'][text['answer'][i]]);
        }
        return answer.join(', ');
        break;
    }
  }
  return (
    <div className="p-3">
      <Row>
        <Col sm="auto">
          <InputGroup>
            <InputGroup.Text>単元</InputGroup.Text>
            <Form.Select value={UnitId} onChange={changeUnitId}>
              <option value="none" className="d-none">選択してください</option>{Unit.map((unit,id) => 
              <option value={id} key={`unit-${id}`}>{unit}</option>)}
            </Form.Select>
          </InputGroup>
        </Col>
        <Col sm="auto">{UnitId === undefined ? "":
          <InputGroup>
            <InputGroup.Text>小単元</InputGroup.Text>
            <Form.Select value={TextId} onChange={changeTextId}>
              <option value="none">選択してください</option>{Texts[UnitId].map((unit,id) => 
              <option value={id} key={`text-${id}`}>{unit['name']}</option>)}
            </Form.Select>
          </InputGroup>}
        </Col>
      </Row>{(TextId === undefined || Text === undefined) ? "":
      <Row className="mt-2">{CurrentTextOrder >= 0 ? CurrentTextOrder >= Text.length ?
        <Col sm="6">
          <Alert variant="info">
            テストは終了しました！！<br />
            お疲れ様です！！
          </Alert>
          今回のテスト結果です。
          <Accordion defaultActiveKey={0}>{Text.map((text,id) => 
            <Accordion.Item eventKey={id} key={`res-${id}`}>
              <Accordion.Header>
                <span>
                  {id + 1}.&nbsp;
                </span>
                <ReactMarkdown rehypePlugins={[rehypeKatex]} remarkPlugins={[remarkMath]}>
                  {text['question']}
                </ReactMarkdown>
              </Accordion.Header>
              <Accordion.Body>
                <div>
                  回答
                  <ReactMarkdown rehypePlugins={[rehypeKatex]} remarkPlugins={[remarkMath]}>
                    {ConvertAnswer(text)}
                  </ReactMarkdown>
                </div>
                <Table striped>
                  <thead>
                    <tr>
                      <td>回目</td>
                      <td>解答</td>
                    </tr>
                  </thead>
                  <tbody>{Result[id].map((res,n) => 
                    <tr key={`res-${n}`}>
                      <td>{n + 1}</td>
                      <td>
                      <ReactMarkdown rehypePlugins={[rehypeKatex]} remarkPlugins={[remarkMath]}>
                        {text['answerTex']?
                        `$${res}$`:res}
                      </ReactMarkdown>{n === Result[id].length-1?
                        <span className="btn btn-success">O</span>:
                        <span className="btn btn-danger">X</span>}
                      </td>
                    </tr>)}
                  </tbody>
                </Table>
              </Accordion.Body>
            </Accordion.Item>)}
          </Accordion>
        </Col>:
        <Col sm="6">
            <div className="mb-2">
              <span>
                {CurrentTextOrder + 1}.&nbsp;
              </span>
              <ReactMarkdown rehypePlugins={[rehypeKatex]} remarkPlugins={[remarkMath]}>
                {Text[CurrentTextOrder]['question']}
              </ReactMarkdown>
            </div>
            <Form noValidate ref={FormElement}>
              <div className="my-2">
                  {createAnswerArea(Text[CurrentTextOrder])}
                  {Validate?<span className="text-danger">違います！</span>:""}
              </div>
              <div className="mt-2">
                <Button variant="primary" type="submit" onClick={submitAnswer}>次へ</Button>
              </div>
            </Form>
        </Col>:
        <Col></Col>}
      </Row>}
      <div className="mt-5">
        <a href="https://github.com/ikeyu-tp" target={"_blank"} className="me-3">ソースコード</a>
        <a href="https://home.hiroshima-u.ac.jp/m225513" target={"_blank"}>Y.IKEDA</a>
      </div>
    </div>
  );
}
