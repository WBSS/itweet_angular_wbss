module itweet.overview {

    export class RHBOverviewController extends OverviewController {

        validateTweet(currentTweet){
            if(!super.validateTweet(currentTweet)) return false;
            if(!currentTweet.itemQs.refLocationId && !currentTweet.itemQs.refTrackId && !currentTweet.itemQs.trackPosition && currentTweet.refItemCategoryId != 86) return false;
            return true;
        }
        
        gotoDetail(destination:string){
        	if(destination === 'app.category'){
        		this.$scope.storageService.currentTweet.itemQs.refItemCategoryQsId = null;
        	}
	       super.gotoDetail(destination);
        }
    }
}