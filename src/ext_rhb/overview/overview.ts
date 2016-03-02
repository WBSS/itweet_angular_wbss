module itweet.overview {

    export class RHBOverviewController extends OverviewController {

        validateTweet(currentTweet){
            // screen text: not empty
            // screen location: choose minimum one of location, track, trackposition
            // screen categories: choose one (improve only static number) //[uk] ToDo for other categories!
            // screen train: choose minimum one of train, wagon
            //!currentTweet.itemQs.refLocationId
            if (this.isCatergoryIeadsProposal()) {
                if (currentTweet.txt) {
                    return true;
                }
                return false;
            }
            else
            {
                if (currentTweet.txt
                    && (currentTweet.itemQs.refLocationId || currentTweet.itemQs.refTrackId || currentTweet.itemQs.trackPosition)
                    && currentTweet.refItemCategoryId
                    && (currentTweet.itemQs.refTrainId || currentTweet.itemQs.refWagonId)) {
                    return true;
                }
                return false;
            }
        }

        isCatergoryIeadsProposal() {if(this.$scope.storageService.currentTweet.refItemCategoryId==this.config.CATEGORY_IDEAS_PROPOSAL) return true; else return false;}
        
        gotoDetail(destination:string){
        	if(destination === 'app.category'){
        		this.$scope.storageService.currentTweet.itemQs.refItemCategoryQsId = null;
        	}
	       super.gotoDetail(destination);
        }
    }
}