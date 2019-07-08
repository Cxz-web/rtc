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
				path: 'liveHandle',
				name: 'live-handle',
				component: require('@/components/foregin/NewHandle').default
				
			},
			
			{
				path: 'newRtc',
				name: 'new-rtc',
				component: require('@/components/foregin/newForeign').default
			},
			
			{
				path: 'testRtc',
				name: 'test-rtc',
				component: require('@/components/foregin/testForeign').default
			},
			
			{
				path: 'oldRtc',
				name: 'old-rtc',
				component: require('@/components/foregin/oldForeign').default
			},
			
			{
				path: 'obs',
				name: 'tool-video',
				component: require('@/components/foregin/toolVideo').default
			},{
				path: 'noRtc',
				name: 'no-rtc',
				component: require('@/components/foregin/noForeign').default
			}
		]
	},
	
    {
      path: '*',
      redirect: '/'
    }
  ]
})
