using Uno;
using Uno.UX;
using Uno.Collections;

namespace Fuse
{
	public partial class Visual
	{
		float _zOffset = 0;
		/**
			Specifics a ZOffset, higher values are in front of other nodes. Only used by certain Node's,
			such as `Panel`. The ZLayer has priority, then ZOffset, then ZOffsetNatural.
		*/
		public float ZOffset
		{
			get { return _zOffset; }
			set
			{
				if (_zOffset == value)
					return;
				_zOffset = value;
				if (Parent != null)	
					Parent.InvalidateZOrder();
			}
		}

		internal IEnumerable<Visual> ZOrder
		{
			get { throw new Exception("TODO"); }
		}

		internal IEnumerable<Visual> ZOrderReverse
		{
			get { throw new Exception("TODO"); }
		}

		/** Brings the given child to the front of the Z-order. 
			In UX markup, use the @BringToFront trigger action instead.
		*/
		public void BringToFront(Visual item)
		{
		}

		/** Sends the given child to the back of the Z-order. 
			In UX markup, use the @SendToBack trigger action instead.
		*/
		public void SendToBack(Visual item)
		{
		}

		internal event EventHandler ZOrderChanged;
		protected virtual void OnZOrderInvalidated() {}
	
		void InvalidateZOrder()
		{
			OnZOrderInvalidated();
			if (ZOrderChanged != null)
				ZOrderChanged(this, EventArgs.Empty);
		}

		

		class ZOrderEnumerator: IEnumerator<Visual>
		{
			Visual _current;
			public Visual Current
			{
				get { return _curent; }
			}

			public void MoveNext()
			{

			}
		}
		
	}
}
