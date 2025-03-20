import Image from "next/image";

export default function Collage() {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
      <div className="overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all duration-300">
        <Image 
          src="/chaycecals.jpg" 
          alt="Photo 1" 
          width={200} 
          height={200} 
          className="object-cover w-full h-full transform hover:scale-105 transition-transform duration-500" 
          quality={90}
        />
      </div>
      
      <div className="overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all duration-300">
        <Image 
          src="/chayceretard.jpg" 
          alt="Photo 2" 
          width={200} 
          height={200} 
          className="object-cover w-full h-full transform hover:scale-105 transition-transform duration-500" 
          quality={90}
        />
      </div>
      
      <div className="overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all duration-300">
        <Image 
          src="/chyacefocues.jpg" 
          alt="Photo 3" 
          width={200} 
          height={200} 
          className="object-cover w-full h-full transform hover:scale-105 transition-transform duration-500" 
          quality={90}
        />
      </div>
      <div className="overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all duration-300">
        <Image 
          src="IMG_5512.jpeg" 
          alt="Photo 4" 
          width={200} 
          height={200} 
          className="object-cover w-full h-full transform hover:scale-105 transition-transform duration-500" 
          quality={90}
        />
      </div>
    </div>
  );
}