// Get the modal
			var modal = document.getElementById("myModal");


			// Get the image and insert it inside the modal - use its "alt" text as a caption
			var modelImages = document.getElementsByClassName("modelImages");

			for(var i = 0; i < modelImages.length; ++i)
			{
				var img = modelImages[i];
				var modalImg = document.getElementById("img01");
				var captionText = document.getElementById("caption");
				img.onclick = function(){
				  modal.style.display = "block";
				  modalImg.src = this.src;
				  captionText.innerHTML = this.alt;
				}
			}

			// Get the <span> element that closes the modal
			var span = document.getElementsByClassName("close")[0];

			// When the user clicks on <span> (x), close the modal
			span.onclick = function() { 
			  modal.style.display = "none";
			}
			
			// Get the <span> element that closes the modal
			var span2 = document.getElementsByClassName("modal")[0];

			// When the user clicks on <span> (x), close the modal
			span2.onclick = function() { 
			  modal.style.display = "none";
			}
			
			
			
			
			$("#slider").on("input change", (e)=>{
			  const sliderPos = e.target.value;
			  // Update the width of the foreground image
			  $('.foreground-img').css('width', `${sliderPos}%`)
			  // Update the position of the slider button
			  $('.slider-button').css('left', `calc(${sliderPos}% - 18px)`)
			});