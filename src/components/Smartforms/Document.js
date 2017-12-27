import React from 'react';
import { Label, UncontrolledTooltip } from 'reactstrap'
import { t } from '../../data/constants'
import postData from '../../ajax/post'
import { STORAGE_URL } from '../../data/constants'
import { setData } from '../../reducers/generalData'
import { debounce, map, remove, toArray } from 'lodash'
import Fa from '@fortawesome/react-fontawesome';
import { faArrowUp, faPlus } from '@fortawesome/fontawesome-free-solid'


let showLabels = ({lines, name, focus}, files) => {
  return (focus === name &&
    <div style={{ maxWidth: `100%`, opacity: 1, overflow: 'hidden'}} className="d-flex flex-column justify-content-around">
      {map(lines, (v, k) => {
          let display = toArray(files[k]).length !== (v.limit || 1)
          return (
            <Label key={k} for={v.name} className={"btn text-justify no-margin " + (!display ? "teal-btn" : "btn-secondary")} title={t(v.label)}>
              <Fa name={!display ? "check" : "upload"} /><span style={{padding: '0 15px'}}>{t(v.label)}</span>
            </Label>)
        }
      )}
    </div>
  )
}


let rememberSass = {};
let collectForSass = new Set();
let bulkSass = debounce(cb => {
  postData(`${STORAGE_URL}/api/sas/multi`, {"fileIds": Array.from(collectForSass)}, (r, s) =>{
    map(r, v => rememberSass[v.fileUploadId] = v.fullUrl)
    cb();
  }, {'Content-Type': 'application/json'})
  collectForSass = new Set();
}, 1000, {leading: true, maxWait: 3000})
let getImgSass = (id, cb) => {
  if(rememberSass[id]) return rememberSass[id];
  collectForSass.add(id);
  bulkSass(cb);
}

export default class Document extends React.Component {
  constructor(props) {
    super(props);
    const { setFiles, files, handleUpload } = this.props;

    this.uploadFile = (f, line, limit = 1) => {
      let override = this.replaceImg || false
      delete this.replaceImg;
      this.setState({uploadingFile: this.state.uploadingFile + 1});
      handleUpload(f.target.files[0], line, (res, status) => {
        if(status === 200) {
          if(!files[line]) files[line] = [];
          // If the limit is 1 and there is a file in the array, direct to override it
          if(files[line].length === limit && !override) override = files[line][0];
          files[line].push(res.fileId);
          if(override !== false) remove(files[line], fv => fv===override)
          setFiles(toArray(files))
        }
        this.setState({uploadingFile: this.state.uploadingFile - 1});
      });
    }

    this.confirmDelete = (line, id) => {
      const { setFiles, files } = this.props;
      if(this.state.confirmDelete === 1) {
        remove(files[line], v => v === id)
        setFiles (files)
      }

      setTimeout(() => this.setState({confirmDelete: 0}), 2000)
      this.setState({confirmDelete: 1});
    }

    this.openLightbox = (img) => () => {
      setData({name: 'lightbox', data: img})
    }

    this.state = {uploadingFile: 0};
  }
  render () {
    const { info, files, readOnly } = this.props;
    const {title, lines = [] } = info;
    let lineAmount = lines.length;
    let thumbnailSize = lineAmount > 1 ? 38 : 76;

    return (
      <div className={`col-12 col-lg-${this.props.size}`}>
        <div className={"color-darkblue strong " + (this.props.error ? "error-blink" : '')} style={{padding: '10px'}}>{title}</div>
        <div className="d-flex">
          <Label for={lineAmount === 1 ? lines[0].name : 'dummy'} className="fileUploadSquare"><Fa icon={this.state.uploadingFile ? faArrowUp : faPlus} className={`fa ${this.state.uploadingFile ? "animateUp" : ""}`} /></Label>
          {map(lines, (v, k) =>
            <input disabled={readOnly} key={k} type="file" name={v.name} id={v.name} onChange={f => this.uploadFile(f, k, v.limit)} />
          )}
          <div className={"d-flex flex-column justify-content-around"} style={{padding: '0 10px'}}>
            {map(lines, (v, k) => {
              return (
                <div key={k} className="d-flex flex-row" style={{minHeight: '38px'}}>
                  {map(files[k], (fv, fk) => {
                      // Prevent the user from preceding before re-uploading the invalid files
                      let thisImage = getImgSass(fv, () => setData({"images_loaded": 1}));
                      if(thisImage) return (
                        <div key={fk}>
                          <div id={v.name+fk} style={{background: `url(${thisImage}) no-repeat center center/cover`, cursor: 'pointer', height: thumbnailSize+'px', width: thumbnailSize+'px', borderRadius: '2px', margin: '0 5px', outline: (fv.invalid) ? '5px solid red' : 'none'}} className="short-shadow"/>
                          <UncontrolledTooltip placement="top" target={v.name+fk} autohide={false} delay={{show:0, hide: 20}}>
                            {!readOnly && <div style={{width: '200px', margin: '0 -10px'}} className="btn btn-secondary btn-danger" onClick={() => this.confirmDelete(k, fv)}>{this.state.confirmDelete > 0 ? t("Are you sure?") : <Fa name="trash" />}</div>}
                            {!readOnly && <Label for={v.name} style={{width: '200px', margin: '0 -10px'}} className="btn btn-secondary btn-teal" onClick={() => this.replaceImg = fv}>{t('Replace')}</Label>}
                            <div style={{width: '200px', margin: '0 -10px'}} className="btn btn-secondary btn-teal" onClick={this.openLightbox(thisImage)}>{t('View')}</div>
                          </UncontrolledTooltip>
                        </div>
                      )
                    }
                  )}
                </div>
              )}
            )}
          </div>
          {showLabels({...this.props, ...this.props.info, }, files)}
        </div>
      </div>)
  }
}