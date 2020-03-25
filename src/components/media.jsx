import React from 'react'
import WebCam from 'react-webcam'
import * as poseEstimation from '@tensorflow-models/posenet'
import ear1 from '../images/kp.png'
import nose1 from '../images/nose1.png'
import {BsChevronUp,BsChevronDown,BsCamera} from 'react-icons/bs'
import adapter from 'webrtc-adapter'

export default class MediaComponent extends React.Component{
	constructor(props){
		super(props)
		this.webCamRef=React.createRef()
		this.tryOn=this.tryOn.bind(this)
		this.drawObject = this.drawObject.bind(this)
		this.toggleSection = this.toggleSection.bind(this)
		this.repeatTryon = this.repeatTryon.bind(this)
		this.imageCLick=this.imageCLick.bind(this)
		this.nathiyaClick=this.nathiyaClick.bind(this)
		this.drawNathiya= this.drawNathiya.bind(this)
		this.clearFrames=this.clearFrames.bind(this)
		this.imgRef=React.createRef() 
		this.nathiya= React.createRef()
		this.canvasRef=React.createRef()
		this.state={
			showSelecter:false,
			cameraAccess:true,
			loading:true
		}
		this.lx=0;
		this.ly=0;
		this.ry=0;
		this.rx=0;
		this.nosex=0;
		this.nosey=0;
		if(window.innerWidth>=640){
			this.height=640
			this.width=640	
		} else{
			this.height=500
			this.width=500
		}
	}

	componentDidMount(){ 
		navigator.mediaDevices
		.getUserMedia({video: {
  		  facingMode:"user" , width: 500 , height: 500}
		  })
		.then((stream)=>{
			//console.log('inside stream')
			this.webCamRef.current.srcObject=stream 
			 this.tryOn()
		})
		.catch((err)=>{
			//console.log('err in getUserMedia',err)
			this.setState({
				cameraAccess:false
			})
		})
	}
	async tryOn(){
		//console.log('posenet loading..')
		let posenetgot = await poseEstimation.load({
	      architecture: 'MobileNetV1',
		  outputStride: 16,
		  inputResolution: { width: 230, height: 230 },
		  multiplier: 0.50
		})
		this.posenet=posenetgot
		//console.log('posenet Loaded')
		this.repeatTryon()
		
		
		
	}
	async repeatTryon(){
		this.posenet.estimateSinglePose(this.canvasRef.current, {
  		  flipHorizontal: false
		}).then((pose)=>{
			this.setState({
				loading:false
			})
			this.canvasRef.current.getContext('2d').drawImage(this.webCamRef.current,0,0,this.canvasRef.current.height,this.canvasRef.current.width)
			//stabilizing the co-ordinates
			let prevx=this.lx
			let prevy=this.ly
			let prevrx=this.rx
			let prevry= this.ry
			let prevnx=this.nosex
			let prevny=this.nosey
			this.nosex=pose.keypoints[0].position.x + 20
			this.nosey=pose.keypoints[0].position.y - 18

			this.nosex=(this.nosex-prevnx)*0.60 + prevnx
			this.nosey=(this.nosey-prevny)*0.60 + prevny	

			this.rx=pose.keypoints[4].position.x - 17
			this.ry =pose.keypoints[4].position.y
			this.lx=pose.keypoints[3].position.x - 13 
			this.ly=pose.keypoints[3].position.y 
		
			this.rx=(this.rx-prevrx)*0.60 + prevrx 
			this.ry = (this.ry-prevry)*0.60 + prevry

			this.lx=(this.lx-prevx)*0.60 + prevx 
			this.ly = (this.ly-prevy)*0.60 + prevy
			setTimeout(()=>{
				this.repeatTryon()
			},1)
		})
	}

	drawObject(){
		this.canvasRef.current.getContext('2d').drawImage(this.imgRef.current,this.lx,this.ly,50,80)
		this.canvasRef.current.getContext('2d').drawImage(this.imgRef.current,this.rx,this.ry,50,80)
		this.e = window.requestAnimationFrame(this.drawObject)
	}
	imageCLick(){
		this.toggleSection()
		//this.repeatTryon()
		window.requestAnimationFrame(this.drawObject)
		
	}
	nathiyaClick(){
		this.toggleSection()		
		//this.repeatTryon()
		window.requestAnimationFrame(this.drawNathiya)		
	}
	toggleSection(){
		this.setState({
			showSelecter: !this.state.showSelecter
		})
	}
	drawNathiya(){
		this.canvasRef.current.getContext('2d').drawImage(this.nathiya.current,this.nosex,this.nosey,35,50)
		this.n=window.requestAnimationFrame(this.drawNathiya)
	}
	clearFrames(){
		window.cancelAnimationFrame(this.e)
		window.cancelAnimationFrame(this.n)
		window.cancelAnimationFrame(this.r)
		this.toggleSection()
	}
	render(){
		return(
			<div> 
			{this.state.cameraAccess ? 
			<div>
				<img ref={this.imgRef} src={ear1} height="0px" width="0px"/>
				<img ref={this.nathiya} src={nose1} height="0px" width="0px"/>			
				<video ref={this.webCamRef} autoPlay className="video"></video>
				<div className="canvas-wrapper">
				<canvas ref={this.canvasRef} height={this.height} width={this.width} className="canvas"></canvas>
				</div>
				{this.state.loading ? 
				<div className="selector">
					<p className="text"> Loading...</p>
				</div>
				:
				<div className="selector">
					<div className="selector-line">
					{!this.state.showSelecter ? 
					<div className="m-auto" onClick={this.toggleSection}>
						<button className=" btn earring-button " >&bull; Ear-rings  </button>
						<span className="bigdot ml-1 mr-1">&bull;</span>
						<button className="btn earring-button">Nose Rings &bull;</button>
						<button className=" earring-uparrow" onClick={this.toggleSection}><BsChevronUp/> </button>
					</div>
					:
					<div className="earring-selector">
						<div className=" m-auto" onClick={this.toggleSection}>
							<button className=" earring-button " >&bull; Ear-rings  </button>	
							<span className="bigdot ml-1 mr-1">&bull;</span>
							<button className="btn earring-button">Nose Rings &bull;</button>
							<button className="earring-uparrow" onClick={this.toggleSection}><BsChevronDown/> </button>
						</div>
						<div className="image-section">
							<img  src={ear1} height="190px" width="160px" className=" ml-3 img-fluid" onClick={this.imageCLick}/>
							<img src={nose1} height="100px" width="80px" className="mr-2 ml-4 " onClick={this.nathiyaClick}/>
						</div>
						<div className="text-center mt-0 mb-2">
							<button className="btn clear" onClick={this.clearFrames}>Clear View</button>
						</div>
					</div>
					}
					</div>
				</div>
			}
			</div>
			: 
			<div>
				<span className="camera-icon">
					<BsCamera/>
				</span>
				<p className="text mt-5">We need Camera access for the Try On . Please open Site settings and ALLOW Camera Access.</p>
			</div>
			}
			</div>
			)
	}
}