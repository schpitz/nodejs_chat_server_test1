/**
 * Created by Schpitz on 14/06/2016.
 */

function func (s,a,b) {
    if (!s.match(/^$/)) {

        // var i=s.length;
        var aIndex = -1;
        var bIndex = -1;

        var isA = false;
        var isB = false;
        for (var i=0 ; i<s.length ; i++){
            if (s.substring(i,i+1)==a)
                aIndex=i;
            if (s.substring((i,i+1)==b)
                bIndex=i;

        }
        while ((aIndex==-1) && (bIndex==-1) && (i>=0))
        {
            if (s.substring(i,i+1)==a)
                aIndex=i;
            if (s.substring(i,i+1)==b)
                bIndex=i;
            i--;
        }

        if (aIndex!=-1){
            if (bIndex==-1)
                return aIndex;
            else
                return Max(aIndex,bIndex);
        } else {
            if (bIndex!=-1)
                return bIndex;
            else
                return -1;
        }
    }

    return -1;
}