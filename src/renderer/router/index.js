import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'login-page',
      component: require('@/components/LoginPage').default
    },
	
	{
		path: '/live',
		name: 'live-page',
		component: require('@/components/LivePage').default,
		children: [
			{
				path: 'lessonMain',
				name: 'lesson-main',
				component: require('@/components/foregin/lessonMain').default
			},
			{
				path: 'lessonsDetails',
				name: 'lessons-details',
				component: require('@/components/foregin/lessonsDetails').default
			},
			{
				path: 'liveHandle',
				name: 'live-handle',
				component: require('@/components/foregin/NewHandle').default
				
			},
			{
				path: 'rtc',
				name: 'live-rtc',
				component: require('@/components/foregin/foreign_teacher_video').default
			},
			{
				path: 'edit',
				name: 'edit-ppt',
				component: require('@/components/foregin/EditPPT').default
			},
			{
				path: 'newRtc',
				name: 'new-rtc',
				component: require('@/components/foregin/newForeign').default
			}
		]
	},
	
		
		
    {
      path: '*',
      redirect: '/'
    }
  ]
})
