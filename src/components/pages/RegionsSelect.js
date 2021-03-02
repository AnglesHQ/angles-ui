import React, {Component} from 'react';
import {withRouter} from 'react-router-dom';
import RegionSelect from 'react-region-select';
import axios from "axios";

class RegionsSelect extends Component {
    constructor (props) {
        super(props);
        this.editingEnabled = props.editingEnabled != undefined ? props.editingEnabled : true;
        this.baselineDetails = props.baseline;
        this.regionRenderer = this.regionRenderer.bind(this);
        this.onChange = this.onChange.bind(this);
        this.init = this.init.bind(this);
        //get existing ignore blocks
        this.existingIgnoreBlocks = [];
        if (this.baselineDetails
            && this.baselineDetails.ignoreBoxes
            && this.baselineDetails.ignoreBoxes.length > 0) {
            this.baselineDetails.ignoreBoxes.forEach(block => {
                this.existingIgnoreBlocks.push(
                    {x:block.left,
                        y:block.top,
                        width:100-(block.left+block.right),
                        height:100-(block.top+block.bottom),
                        data:{}
                    }
                );
            });
        }
        this.state = {
            regions:this.existingIgnoreBlocks  //< putting this.existingIgnoreBlocks here breaks it
        };
        this.init(this.existingIgnoreBlocks);
        this.imgSrc = this.props.image;
        this.nrOfRegions = parseInt(this.props.nrOfRegions);
        this.ignoreBlocks = null;
        this.editing = false;
    }
    onChange (newRegions) {
        newRegions.forEach(el=>{
            el.x = parseInt(el.x);
            el.y = parseInt(el.y);
            el.width = parseInt(el.width);
            el.height = parseInt(el.height);
        });
        if(this.editing) {
            this.setState({
                regions: newRegions
            });
        }
    }
    init(newRegions){
        this.setState({regions:newRegions});
    }

    onSaveToBaseline(baselineDetails){
        console.log("Saving to Baseline");
        let payload = {
            screenshotId:baselineDetails.screenshot._id,
            ignoreBoxes:this.ignoreBlocks };
        return axios.put(`/baseline/${baselineDetails._id}/`,payload,{headers:{'Content-Type':'application/json'}})
            .then((res) => {
                console.log(JSON.stringify(res));
                // this.setState({ screenshots: res.data });
            })

    }

    changeRegionData (index, event) {
        const region = this.state.regions[index];
        let regions = [];
        switch (event.target.value) {
            case 'delete':
                //delete region
                regions = this.state.regions.filter(s => s !== region);
                this.onChange(regions);
                break;
            default:
                break;
        }
    }

    regionRenderer (regionProps) {
        if (!regionProps.isChanging) {
            return (
                <div style={{position: 'absolute', right: 0, bottom: '-25px'}}>
                    {
                        this.editingEnabled ?
                            <button onMouseUp={(event) => this.changeRegionData(regionProps.index, event)}
                                    value="delete">Delete
                            </button> :
                            null
                    }
                </div>
            );
        }
    }
    render() {
        const regionStyle = {
            background: 'rgba(0, 255, 80, 0.3)'
        };
        this.ignoreBlocks = [];
        if(this.state != null) {
            this.state.regions.forEach(crtRegion => {
                this.ignoreBlocks.push({
                    'left': crtRegion.x,
                    'top': crtRegion.y,
                    'right': 100 - (crtRegion.x + crtRegion.width),
                    'bottom': 100 - (crtRegion.y + crtRegion.height)
                })
            });
        }
        return (
            <div style={{ display: 'block' }}>
                <div style={{ flexGrow: 1, flexShrink: 1, width: '100%' }}>
                    <RegionSelect
                        maxRegions={this.nrOfRegions}
                        regions={this.state.regions}
                        regionStyle={regionStyle}
                        constraint
                        onChange={this.onChange}
                        regionRenderer={this.regionRenderer}
                        style={{border: '1px solid black'}}
                    >
                        <img src={this.imgSrc} alt='your baseline' id='baseline' width='100%'/>
                    </RegionSelect>
                </div>
                {this.ignoreBlocks.length > 0 ?
                    (
                        <p>Ignored Regions
                            <div>
                                {this.ignoreBlocks.map(el => <p>Left:{el.left},Top:{el.top},Right:{el.right},Bottom:{el.bottom}</p>)}
                            </div>
                            {this.editingEnabled ?
                                (<div>
                                        <button onMouseUp={(event) => {
                                            this.onSaveToBaseline(this.baselineDetails);
                                        }}
                                        > Save to Baseline
                                        </button>
                                        <button onMouseUp={() => {
                                            this.editing = !this.editing;
                                            this.setState({});
                                        }}
                                        >
                                            {this.editing ? <span>Save</span> : <span>Edit</span>} Ignore Blocks
                                        </button>
                                    </div>
                                ) : null
                            }
                        </p>) : null}
            </div>
        );
    }
}
export default withRouter(RegionsSelect);
