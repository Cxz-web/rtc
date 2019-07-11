<template>
	<div class="lesson" >
		<div class="lesson__title"><div class="title__icon"></div>Dual-teacher Live Broadcast&nbsp;&nbsp;( {{envInfo.text}} ) </div>
	
		<div class="lesson__reload" @click="reload" v-show="showLesson"></div>
		<div class="lesson__back" @click="back" v-show="showLesson"></div>
		<div class="lesson__reload" @click="reloadTable" v-show="!showLesson"></div>
		
		
		<div class="lesson__wrap" v-show="showLesson">
			<div class="lesson__table">
				<div class="table__1">Course</div>
				<div class="table__2">teacher</div>
				<div class="table__3">tutor</div>
				<div class="table__4">subject</div>
				<div class="table__5">Next Lesson</div>
				<div class="table__6">Status</div>
			</div>
			
			
			<div class="lesson__content animated fadeInUp " v-for="(item, index) in list"  :key="item.F_lesson_id" :style="`animation-delay: ${index *0.2}s; animation-duration: 1.2s;`">
				<div class="table__1">{{ item.F_name }}</div>
				<div class="table__2">{{ item.F_teacher.F_name}}</div>
				<div class="table__3">{{ item.F_tutor.F_name}}</div>
				<div class="table__4">English</div>
				<div class="table__5">{{ item.F_livestart }}</div>
				<div class="table__6 btn__wrapBox ">
					<div class="btn" @click.stop="toLive(item.F_lesson_id, item.F_name)">Live</div>
				</div>
			</div>
		</div>
		
		
			<div class="bigLesson" v-show="!showLesson&&bigList.length>0">
				
					<div v-for="item in bigList">
						<template v-if="item.F_course_list[0]">
							<div class="bigLesson-item lesson__content fadeIn">
								<div class="bigLesson-name">{{ item.F_course_list[0].F_course_title}}</div>
								<div class="bigLesson-btn" @click="getLessonList(item.F_course_list[0].F_course_id)">enter</div>
							</div>
						</template>
					</div>
			</div>
		
		
		<div class="page" v-show="!showLesson">
			<el-pagination
				:page-size="pageSize"
				layout="prev, pager, next"
				:total="total"
				@current-change="currentPage"
				:current-page="page"
			>
			</el-pagination>
			
		</div>
		
		
	</div>
	
	
	
	
</template>

<script>
	import axios from 'axios'
	import { mapState } from "vuex"
	const { ipcRenderer } = require('electron')
	let loading = null
	export default {
		name: 'lesson-main',
		data() {
			return {
				list: [],
				page: 1,
				showLesson: false,
				courseid: '01201905061453049367',
				bigList: [],
				total: 0,
				pageSize: 7,
				index: 1,
				type: 1
				
			}
		},
		created() {
			this.type = this.enviroment === 'test' ? 1 : 2
			this.courseid = this.envInfo.courseId
			console.log(this.rtnUrl, this.apiUrl)
			this.TOKEN = this.$store.state.token
			// this.getLessonList()
			console.log(this.envInfo.courseId)
			this.getClasses()
		},
		
		computed: {
			...mapState(['rtnUrl', 'apiUrl', 'envInfo', 'enviroment'])
		},
		
		methods: {
			currentPage(page) {
				this.bigList = []
				this.index = page
				this.getClasses(page)
			},
			// 获取讲师课程
			reloadTable() {
				this.getClasses(this.index)
			},
			getClasses(page) {
				loading = this.$loading({
				      lock: true,
				      text: 'Reading data...',
				      spinner: 'el-icon-loading',
				      background: 'rgba(0, 0, 0, 0.7)'
				})
				const api = "/v2/webapi/term/terms"
				const options = {	
					method: "get",
					url: this.apiUrl + api,
					headers: {'Authorization': this.TOKEN},
					params: {
						page: page || 1,
						page_size: 7,
						type: this.type,
						grade: 0,
						subject: 0,
						kind: -1,
						model: -1,
						order_type: -1,
						
					}
				}
				
				axios(options).then((res) => {
					const data = res.data
					this.bigList = data.F_term_list
					this.total = data.F_term_count
					loading.close()
				}).catch(() => {
					loading.close()
					this.notice()
				})
			},
			
			
			notice() {
				const n = new Notification('读书郎提示你', {
					body: 'Network error, please try again!',
					tag: 'Readyboy Tip',
					icon: require('../../assets/tip.png'),
					timestamp: 3000
				});
			},
			
			reload() {
				if(!this.id) return
				this.list = []
				this.getLessonList(this.id)
			},
			
			back() {
				this.showLesson = false
				// this.list = []
			},
			
			getLessonList(id) {
				this.id = id
				loading = this.$loading({
				      lock: true,
				      text: 'Reading data...',
				      spinner: 'el-icon-loading',
				      background: 'rgba(0, 0, 0, 0.7)'
				 })
				
				let options = {
					method: 'get',
					url: this.apiUrl + `/v2/webapi/lesson/lessons?courseid=${id}`,
					headers: {'Authorization': this.TOKEN}
				}
				
				axios(options).then((res) => {
					this.showLesson = true
					const data = res.data
					this.list= data.F_lesson_list
					loading.close()
				}).catch((e)=>{
					this.showLesson = false
					this.notice()
					loading.close()
				})
				
			},
			
			toLive(lessonid, lessonName) {
				this.$store.dispatch('setLessonName', lessonName)
				// this.$router.push(`/live/testRtc?lessonid=${lessonid}`)
				// this.$router.push(`/live/testRtc?lessonid=${lessonid}`)
				// this.$router.push(`/live/testRtc?lessonid=${lessonid}`)
				this.$router.push(`/live/noRtc?lessonid=${lessonid}`)
			}
		}
	}
</script>

<style scoped>
	.lesson {
		color: black;
		animation: lessonIn ease-in-out .3s forwards;
		width: 100%;
		height: 100%;
		background-color: #ecf5ff;
		transform: translate3d(0,0,0);
		will-change: transform; 
		border: 1px solid  #00E0E0;
		box-sizing: border-box;
		border-radius: 4px 4px 5px 5px;
		
	}
	
	@keyframes lessonIn{
		from{
			transform: translate3d(-5px, -10px, 0);
			opacity: 0;
		}
		to{
			transform: translate(0, 0, 0);
			opacity: 1;
		}
	}
	
	.lesson__title{
		
		height: 50px;
		color: white;
		font-size: 24px;
		line-height: 50px;
		text-align: left;
		display: flex;
		padding-left: 10px;
		margin-bottom: 3px;
		background: #ecf5ff;
		color: red;
		background-color: #f2f6fc;
		border-bottom: 1px solid rgb(0,0,0,0.1);
		box-shadow: 0px 1px 5px rgba(0,0,0,0.1);
	}
	
	.title__icon{
		height: 50px;
		width: 60px;
		background-image: url(asserts/u24.png);
		background-size: contain;
		background-position: center;
		background-repeat: no-repeat;
		margin-right: 10px;
	}
	
	.lesson__bread{
		background-color: #e8e8e8;
		height: 50px;
		font-weight: bold;
		font-size: 20px;
		line-height: 50px;
		text-align: left;
		text-indent: 14px;
	}
	.lesson__table{
		margin-top: 10px;
		color: white;
		font-size: 22px;
		background-color: crimson;
		display: flex;
		height: 50px;
		line-height: 50px;
		width: 98%;
		border-radius: 20px;
	}
	
	.table__1{
		width: 31%;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.table__2{width: 12%;}
	.table__3{width: 12%;}
	.table__4{width: 10%;}
	.table__5{width: 20%;}
	.table__6{width: 15%;}
	
	.lesson__content{
		width: 98%;
		display: flex;
		height: 60px;
		border-bottom: 1px solid darkgray;
		line-height: 60px;
		cursor: pointer;
		color: white;
		border-radius: 20px;
		border-bottom: none;
		margin-top: 10px;
		font-size: 20px;
		will-change: transform; 
	}
	.lesson__content:nth-child(n) {
		background-image: linear-gradient(90deg, #FF9A8B 0%, #FF6A88 55%, #FF99AC 100%);
	}
	.lesson__content:nth-child(n+1) {
		background-image: linear-gradient(62deg, #8EC5FC 0%, #E0C3FC 100%);
	}
	
	.lesson__content:nth-child(2n) {
		background-image: linear-gradient(62deg, #FBAB7E 0%, #F7CE68 100%);
	}
	
	.lesson__content:nth-child(2n) {
		background-image: linear-gradient( 135deg, #CE9FFC 10%, #7367F0 100%);
	}
	
	
	.btn__wrapBox{
		display: flex;
		justify-content: center;
		align-items: center;
	}
	
	.btn{
		width: 60%;
		height: 40px;
		background-color: hotpink;;
		letter-spacing: 1px;
		border-radius: 20px;
		color: white;
		line-height: 40px;
		font-weight: bold;
		font-size: 18px;
		transition: transform linear .1s;
		user-select: none;
	}
	
	.btn:active {
		transform: scale(1.2);
	}
	
	.btn--no{
		background-color: darkgray;
	}
	.btn--no{
		background-color: darkgray;
	}
	
	.lesson__content:hover{
		box-shadow: 0px 1px 5px 1px rgba(0,0,0,0.4);
	}
	
	.lesson__wrap {
		display: flex;
		flex-direction: column;
		align-items: center;
		height: 600px;
		overflow-y: scroll;
	}
	
	.lesson__reload{
		background-image: url(./asserts/reload1.svg);
		background-size: cover;
		position: absolute;
		right: 15px;
		bottom: 10px;
		width: 40px;
		height: 40px;
		background-repeat: no-repeat;
		cursor: pointer;
		z-index: 99;
	}
	
	.lesson__back{
		background-image: url(./asserts/bbb.svg);
		background-size: cover;
		position: absolute;
		left: 15px;
		bottom: 10px;
		width: 40px;
		height: 40px;
		background-repeat: no-repeat;
		cursor: pointer;
		z-index: 99;
	}
	
	.lesson__reload:active{
		background-image: url(./asserts/reload2.svg);
	}
	
	.bigLesson{
		width: 69%;
		margin: 0 auto;
		margin-top: 20px;
	}
	
	.bigLesson-item{
		margin-bottom: 16px;
		display: flex;
		justify-content: space-between;
		box-sizing: border-box;
		padding-right: 20px;
		padding-left: 10px;
		border-radius: 30px;
		align-items: center;
	}
	
	.bigLesson-btn{
		width: 80px;
		height: 34px;
		background-color: darkorange;
		display: flex;
		justify-content: center;
		align-items: center;
		line-height: 0px;
		border-radius: 20px;
		cursor: pointer;
		user-select: none;
	}
	
	.bigLesson-btn:active {
		background-color: orangered;
	}
	
	
	.fadeIn{
		animation: fadeIn-in .5s;
	}
	
@keyframes fadeIn-in {
  0% {
    opacity: 0.4;
		transform: translateY(10px);
  }

  100% {
		opacity: 1;
    transform: translateY(0px);
  }
}

.page{
	position: absolute;
	font-size: 24px;
	left: 50%;
	transform: translateX(-50%);
	bottom: 20px;
}


	
	
	
	
</style>
